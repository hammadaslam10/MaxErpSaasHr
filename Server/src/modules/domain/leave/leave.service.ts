import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";

import { RedisService } from "../../infrastructure/redis/redis.service";
import {
  LeaveRequest,
  LeaveType,
  LeaveStatus,
  CreateLeaveRequestDto,
  UpdateLeaveRequestDto,
  LeaveRequestResponse,
  LeaveSummaryDto,
} from "../entities/leave-request.entity";
import { User, UserRole } from "../entities/user.entity";

@Injectable()
export class LeaveService {
  constructor(private readonly redisService: RedisService) {}

  async createLeaveRequest(
    createDto: CreateLeaveRequestDto,
    user: User,
  ): Promise<LeaveRequestResponse> {
    // Validate dates
    this.validateLeaveRequest(createDto);

    // Check leave balance
    await this.checkLeaveBalance(
      user,
      createDto.type,
      createDto.startDate,
      createDto.endDate,
    );

    // Check for overlapping requests
    await this.checkOverlappingRequests(
      user.id,
      createDto.startDate,
      createDto.endDate,
    );

    const leaveRequest: LeaveRequest = {
      id: uuidv4(),
      employeeId: user.id,
      employeeName: user.name,
      employeeEmail: user.email,
      type: createDto.type,
      startDate: createDto.startDate,
      endDate: createDto.endDate,
      reason: createDto.reason,
      status: LeaveStatus.PENDING,
      appliedAt: new Date().toISOString(),
    };

    // Save to Redis
    await this.redisService.hset(
      "leave_requests",
      leaveRequest.id,
      leaveRequest,
    );
    await this.redisService.sadd("pending_requests", leaveRequest.id);
    await this.redisService.sadd("employee_requests", leaveRequest.id);

    return this.mapToResponse(leaveRequest);
  }

  async getPendingRequests(user: User): Promise<LeaveRequestResponse[]> {
    if (user.role !== UserRole.MANAGER) {
      throw new ForbiddenException("Only managers can view pending requests");
    }

    const pendingRequestIds =
      await this.redisService.smembers("pending_requests");
    const requests: LeaveRequestResponse[] = [];

    for (const id of pendingRequestIds) {
      const request = await this.redisService.hget<LeaveRequest>(
        "leave_requests",
        id,
      );
      if (request) {
        requests.push(this.mapToResponse(request));
      }
    }

    return requests.sort(
      (a, b) =>
        new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime(),
    );
  }

  async updateLeaveRequest(
    id: string,
    updateDto: UpdateLeaveRequestDto,
    user: User,
  ): Promise<LeaveRequestResponse> {
    if (user.role !== UserRole.MANAGER) {
      throw new ForbiddenException("Only managers can approve/reject requests");
    }

    const request = await this.redisService.hget<LeaveRequest>(
      "leave_requests",
      id,
    );
    if (!request) {
      throw new NotFoundException("Leave request not found");
    }

    if (request.status !== LeaveStatus.PENDING) {
      throw new BadRequestException("Leave request has already been processed");
    }

    // Update request
    const updatedRequest: LeaveRequest = {
      ...request,
      status: updateDto.status,
      reviewedAt: new Date().toISOString(),
      reviewedBy: user.email,
      comments: updateDto.comments,
    };

    await this.redisService.hset("leave_requests", id, updatedRequest);

    // Remove from pending if approved or rejected
    if (updateDto.status !== LeaveStatus.PENDING) {
      await this.redisService.srem("pending_requests", id);
    }

    // Update leave balance if approved
    if (updateDto.status === LeaveStatus.APPROVED) {
      await this.updateLeaveBalance(
        request.employeeId,
        request.type,
        request.startDate,
        request.endDate,
      );
    }

    return this.mapToResponse(updatedRequest);
  }

  async getEmployeeRequests(
    employeeId: string,
  ): Promise<LeaveRequestResponse[]> {
    const allRequestIds = await this.redisService.smembers("employee_requests");
    const requests: LeaveRequestResponse[] = [];

    for (const id of allRequestIds) {
      const request = await this.redisService.hget<LeaveRequest>(
        "leave_requests",
        id,
      );
      if (request && request.employeeId === employeeId) {
        requests.push(this.mapToResponse(request));
      }
    }

    return requests.sort(
      (a, b) =>
        new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime(),
    );
  }

  async getLeaveSummary(
    employeeId: string,
    month: number,
    year: number,
  ): Promise<LeaveSummaryDto> {
    const user = await this.redisService.hget<User>("users", employeeId);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const allRequestIds = await this.redisService.smembers("employee_requests");
    const requests: LeaveRequest[] = [];

    for (const id of allRequestIds) {
      const request = await this.redisService.hget<LeaveRequest>(
        "leave_requests",
        id,
      );
      if (request && request.employeeId === employeeId) {
        const requestDate = new Date(request.appliedAt);
        if (
          requestDate.getMonth() + 1 === month &&
          requestDate.getFullYear() === year
        ) {
          requests.push(request);
        }
      }
    }

    const summary: LeaveSummaryDto = {
      employeeId,
      employeeName: user.name,
      month,
      year,
      totalRequests: requests.length,
      approvedRequests: requests.filter(
        (r) => r.status === LeaveStatus.APPROVED,
      ).length,
      pendingRequests: requests.filter((r) => r.status === LeaveStatus.PENDING)
        .length,
      rejectedRequests: requests.filter(
        (r) => r.status === LeaveStatus.REJECTED,
      ).length,
      totalDays: this.calculateTotalDays(
        requests.filter((r) => r.status === LeaveStatus.APPROVED),
      ),
      byType: {
        [LeaveType.ANNUAL]: this.calculateByType(requests, LeaveType.ANNUAL),
        [LeaveType.SICK]: this.calculateByType(requests, LeaveType.SICK),
        [LeaveType.PERSONAL]: this.calculateByType(
          requests,
          LeaveType.PERSONAL,
        ),
      },
    };

    return summary;
  }

  private validateLeaveRequest(createDto: CreateLeaveRequestDto): void {
    const startDate = new Date(createDto.startDate);
    const endDate = new Date(createDto.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      throw new BadRequestException("Start date cannot be in the past");
    }

    if (endDate < startDate) {
      throw new BadRequestException("End date cannot be before start date");
    }

    const daysDiff =
      Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      ) + 1;
    if (daysDiff > 30) {
      throw new BadRequestException("Leave request cannot exceed 30 days");
    }
  }

  private async checkLeaveBalance(
    user: User,
    type: LeaveType,
    startDate: string,
    endDate: string,
  ): Promise<void> {
    const daysRequested = this.calculateDays(startDate, endDate);
    const balanceKey = this.getBalanceKey(type);

    if (user.leaveBalance[balanceKey] < daysRequested) {
      throw new BadRequestException(
        `Insufficient ${type.toLowerCase()} leave balance`,
      );
    }
  }

  private async checkOverlappingRequests(
    employeeId: string,
    startDate: string,
    endDate: string,
  ): Promise<void> {
    const allRequestIds = await this.redisService.smembers("employee_requests");

    for (const id of allRequestIds) {
      const request = await this.redisService.hget<LeaveRequest>(
        "leave_requests",
        id,
      );
      if (request && request.employeeId === employeeId) {
        // Check for overlapping dates with both approved and pending requests
        if (
          request.status === LeaveStatus.APPROVED ||
          request.status === LeaveStatus.PENDING
        ) {
          if (
            this.datesOverlap(
              startDate,
              endDate,
              request.startDate,
              request.endDate,
            )
          ) {
            if (request.status === LeaveStatus.PENDING) {
              throw new BadRequestException(
                "You already have a pending leave request for these dates. Please wait for it to be processed before applying again.",
              );
            } else {
              throw new BadRequestException(
                "Leave request overlaps with existing approved leave",
              );
            }
          }
        }
      }
    }
  }

  private async updateLeaveBalance(
    employeeId: string,
    type: LeaveType,
    startDate: string,
    endDate: string,
  ): Promise<void> {
    const user = await this.redisService.hget<User>("users", employeeId);
    if (!user) return;

    const daysUsed = this.calculateDays(startDate, endDate);
    const balanceKey = this.getBalanceKey(type);

    user.leaveBalance[balanceKey] -= daysUsed;
    await this.redisService.hset("users", employeeId, user);
  }

  private calculateDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return (
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    );
  }

  private calculateTotalDays(requests: LeaveRequest[]): number {
    return requests.reduce((total, request) => {
      return total + this.calculateDays(request.startDate, request.endDate);
    }, 0);
  }

  private calculateByType(
    requests: LeaveRequest[],
    type: LeaveType,
  ): { count: number; days: number } {
    const filteredRequests = requests.filter(
      (r) => r.type === type && r.status === LeaveStatus.APPROVED,
    );
    return {
      count: filteredRequests.length,
      days: this.calculateTotalDays(filteredRequests),
    };
  }

  private getBalanceKey(type: LeaveType): keyof User["leaveBalance"] {
    switch (type) {
      case LeaveType.ANNUAL:
        return "annual";
      case LeaveType.SICK:
        return "sick";
      case LeaveType.PERSONAL:
        return "personal";
      default:
        return "annual";
    }
  }

  private datesOverlap(
    start1: string,
    end1: string,
    start2: string,
    end2: string,
  ): boolean {
    const s1 = new Date(start1);
    const e1 = new Date(end1);
    const s2 = new Date(start2);
    const e2 = new Date(end2);

    return s1 <= e2 && s2 <= e1;
  }

  async getAllRequests(): Promise<LeaveRequestResponse[]> {
    const allRequestIds = await this.redisService.smembers('employee_requests');
    const requests: LeaveRequestResponse[] = [];

    for (const id of allRequestIds) {
      const request = await this.redisService.hget<LeaveRequest>('leave_requests', id);
      if (request) {
        requests.push(this.mapToResponse(request));
      }
    }

    return requests.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
  }

  private mapToResponse(request: LeaveRequest): LeaveRequestResponse {
    return {
      id: request.id,
      employeeName: request.employeeName,
      employeeEmail: request.employeeEmail,
      type: request.type,
      startDate: request.startDate,
      endDate: request.endDate,
      reason: request.reason,
      status: request.status,
      appliedAt: request.appliedAt,
      reviewedAt: request.reviewedAt,
      reviewedBy: request.reviewedBy,
      comments: request.comments,
    };
  }
}
