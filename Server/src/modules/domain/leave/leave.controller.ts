import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";

import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";
import { CreateLeaveRequestDto } from "../dto/create-leave-request.dto";
import { UpdateLeaveRequestDto } from "../dto/update-leave-request.dto";
import {
  LeaveRequestResponse,
  LeaveSummaryDto,
} from "../entities/leave-request.entity";
import { UserRole } from "../entities/user.entity";

import { LeaveService } from "./leave.service";

@ApiTags("Leave Management")
@Controller("leave")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("JWT-auth")
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post("apply")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Apply for leave",
    description: "Submit a new leave request (Employee only)",
  })
  @ApiBody({ type: CreateLeaveRequestDto })
  @ApiResponse({
    status: 201,
    description: "Leave request submitted successfully",
    type: LeaveRequestResponse,
  })
  @ApiResponse({
    status: 400,
    description: "Validation error or insufficient leave balance",
    schema: {
      example: {
        statusCode: 400,
        message: "Start date cannot be in the past",
        error: "Bad Request",
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing JWT token",
  })
  async applyForLeave(
    @Body() createDto: CreateLeaveRequestDto,
    @Request() req: any,
  ): Promise<LeaveRequestResponse> {
    return this.leaveService.createLeaveRequest(createDto, req.user);
  }

  @Get("pending")
  @UseGuards(RolesGuard)
  @Roles(UserRole.MANAGER)
  @ApiOperation({
    summary: "Get pending leave requests",
    description: "Retrieve all pending leave requests (Manager only)",
  })
  @ApiResponse({
    status: 200,
    description: "List of pending leave requests",
    type: [LeaveRequestResponse],
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Only managers can access this endpoint",
  })
  async getPendingRequests(
    @Request() req: any,
  ): Promise<LeaveRequestResponse[]> {
    return this.leaveService.getPendingRequests(req.user);
  }

  @Post("approve/:id")
  @UseGuards(RolesGuard)
  @Roles(UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Approve or reject leave request",
    description: "Update leave request status (Manager only)",
  })
  @ApiParam({
    name: "id",
    description: "Leave request ID",
    example: "fec0f159-72fc-4df8-a5bf-f659b0addf5c",
  })
  @ApiBody({ type: UpdateLeaveRequestDto })
  @ApiResponse({
    status: 200,
    description: "Leave request updated successfully",
    type: LeaveRequestResponse,
  })
  @ApiResponse({
    status: 404,
    description: "Leave request not found",
  })
  @ApiResponse({
    status: 400,
    description: "Leave request already processed",
  })
  async approveLeaveRequest(
    @Param("id") id: string,
    @Body() updateDto: UpdateLeaveRequestDto,
    @Request() req: any,
  ): Promise<LeaveRequestResponse> {
    return this.leaveService.updateLeaveRequest(id, updateDto, req.user);
  }

  @Get("my-requests")
  @ApiOperation({
    summary: "Get my leave requests",
    description: "Retrieve all leave requests for the authenticated employee",
  })
  @ApiResponse({
    status: 200,
    description: "List of employee leave requests",
    type: [LeaveRequestResponse],
  })
  @ApiResponse({
    status: 404,
    description: "Employee not found",
  })
  async getMyRequests(@Request() req: any): Promise<LeaveRequestResponse[]> {
    return this.leaveService.getEmployeeRequests(req.user.id);
  }

  @Get("all-requests")
  @Roles(UserRole.MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: "Get all leave requests",
    description: "Retrieve all leave requests for managers",
  })
  @ApiResponse({
    status: 200,
    description: "List of all leave requests",
    type: [LeaveRequestResponse],
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Manager role required",
  })
  async getAllRequests(): Promise<LeaveRequestResponse[]> {
    return this.leaveService.getAllRequests();
  }

  @Get("summary")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Get leave summary",
    description: "Retrieve monthly leave summary for an employee",
  })
  @ApiQuery({
    name: "employeeId",
    description: "Employee ID (required for managers)",
    required: false,
    example: "fec0f159-72fc-4df8-a5bf-f659b0addf5c",
  })
  @ApiQuery({
    name: "month",
    description: "Month (1-12)",
    example: 2,
  })
  @ApiQuery({
    name: "year",
    description: "Year",
    example: 2024,
  })
  @ApiResponse({
    status: 200,
    description: "Leave summary retrieved successfully",
    type: LeaveSummaryDto,
  })
  async getLeaveSummary(
    @Query("employeeId") employeeId: string,
    @Query("month", ParseIntPipe) month: number,
    @Query("year", ParseIntPipe) year: number,
    @Request() req: any,
  ): Promise<LeaveSummaryDto> {
    // Allow managers to view any employee's summary, employees can only view their own
    const targetEmployeeId =
      req.user.role === UserRole.MANAGER ? employeeId : req.user.id;
    return this.leaveService.getLeaveSummary(targetEmployeeId, month, year);
  }
}
