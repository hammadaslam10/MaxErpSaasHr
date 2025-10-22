import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export enum LeaveType {
  ANNUAL = "ANNUAL",
  SICK = "SICK",
  PERSONAL = "PERSONAL",
}

export enum LeaveStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export class LeaveRequest {
  @ApiProperty({
    description: "Leave request ID",
    example: "fec0f159-72fc-4df8-a5bf-f659b0addf5c",
  })
  id: string;

  @ApiProperty({
    description: "Employee ID",
    example: "fec0f159-72fc-4df8-a5bf-f659b0addf5c",
  })
  employeeId: string;

  @ApiProperty({ description: "Employee name", example: "John Doe" })
  employeeName: string;

  @ApiProperty({
    description: "Employee email",
    example: "john.doe@company.com",
  })
  employeeEmail: string;

  @ApiProperty({
    description: "Leave type",
    enum: LeaveType,
    example: LeaveType.ANNUAL,
  })
  type: LeaveType;

  @ApiProperty({
    description: "Start date (YYYY-MM-DD)",
    example: "2024-02-15",
  })
  startDate: string;

  @ApiProperty({ description: "End date (YYYY-MM-DD)", example: "2024-02-16" })
  endDate: string;

  @ApiProperty({ description: "Reason for leave", example: "Family vacation" })
  reason: string;

  @ApiProperty({
    description: "Leave status",
    enum: LeaveStatus,
    example: LeaveStatus.PENDING,
  })
  status: LeaveStatus;

  @ApiProperty({
    description: "Application date",
    example: "2024-01-15T10:30:00.000Z",
  })
  appliedAt: string;

  @ApiPropertyOptional({
    description: "Review date",
    example: "2024-01-15T14:30:00.000Z",
  })
  reviewedAt?: string;

  @ApiPropertyOptional({
    description: "Reviewed by (manager email)",
    example: "mike.johnson@company.com",
  })
  reviewedBy?: string;

  @ApiPropertyOptional({
    description: "Manager comments",
    example: "Approved for family vacation",
  })
  comments?: string;
}

export class CreateLeaveRequestDto {
  @ApiProperty({
    description: "Type of leave request",
    enum: LeaveType,
    example: LeaveType.ANNUAL,
  })
  type: LeaveType;

  @ApiProperty({
    description: "Start date (YYYY-MM-DD)",
    example: "2024-02-15",
  })
  startDate: string;

  @ApiProperty({ description: "End date (YYYY-MM-DD)", example: "2024-02-16" })
  endDate: string;

  @ApiProperty({ description: "Reason for leave", example: "Family vacation" })
  reason: string;
}

export class UpdateLeaveRequestDto {
  @ApiProperty({
    description: "New status for the leave request",
    enum: LeaveStatus,
    example: LeaveStatus.APPROVED,
  })
  status: LeaveStatus;

  @ApiPropertyOptional({
    description: "Optional comments from the manager",
    example: "Approved for family vacation",
  })
  comments?: string;
}

export class LeaveRequestResponse {
  @ApiProperty({
    description: "Leave request ID",
    example: "fec0f159-72fc-4df8-a5bf-f659b0addf5c",
  })
  id: string;

  @ApiProperty({ description: "Employee name", example: "John Doe" })
  employeeName: string;

  @ApiProperty({
    description: "Employee email",
    example: "john.doe@company.com",
  })
  employeeEmail: string;

  @ApiProperty({
    description: "Leave type",
    enum: LeaveType,
    example: LeaveType.ANNUAL,
  })
  type: LeaveType;

  @ApiProperty({
    description: "Start date (YYYY-MM-DD)",
    example: "2024-02-15",
  })
  startDate: string;

  @ApiProperty({ description: "End date (YYYY-MM-DD)", example: "2024-02-16" })
  endDate: string;

  @ApiProperty({ description: "Reason for leave", example: "Family vacation" })
  reason: string;

  @ApiProperty({
    description: "Leave status",
    enum: LeaveStatus,
    example: LeaveStatus.PENDING,
  })
  status: LeaveStatus;

  @ApiProperty({
    description: "Application date",
    example: "2024-01-15T10:30:00.000Z",
  })
  appliedAt: string;

  @ApiPropertyOptional({
    description: "Review date",
    example: "2024-01-15T14:30:00.000Z",
  })
  reviewedAt?: string;

  @ApiPropertyOptional({
    description: "Reviewed by (manager email)",
    example: "mike.johnson@company.com",
  })
  reviewedBy?: string;

  @ApiPropertyOptional({
    description: "Manager comments",
    example: "Approved for family vacation",
  })
  comments?: string;
}

export class LeaveTypeSummary {
  @ApiProperty({ description: "Number of requests", example: 2 })
  count: number;

  @ApiProperty({ description: "Total days taken", example: 3 })
  days: number;
}

export class LeaveSummaryDto {
  @ApiProperty({
    description: "Employee ID",
    example: "fec0f159-72fc-4df8-a5bf-f659b0addf5c",
  })
  employeeId: string;

  @ApiProperty({ description: "Employee name", example: "John Doe" })
  employeeName: string;

  @ApiProperty({ description: "Month (1-12)", example: 2 })
  month: number;

  @ApiProperty({ description: "Year", example: 2024 })
  year: number;

  @ApiProperty({ description: "Total number of requests", example: 3 })
  totalRequests: number;

  @ApiProperty({ description: "Number of approved requests", example: 2 })
  approvedRequests: number;

  @ApiProperty({ description: "Number of pending requests", example: 1 })
  pendingRequests: number;

  @ApiProperty({ description: "Number of rejected requests", example: 0 })
  rejectedRequests: number;

  @ApiProperty({ description: "Total days taken", example: 5 })
  totalDays: number;

  @ApiProperty({
    description: "Summary by leave type",
    type: "object",
    additionalProperties: { $ref: "#/components/schemas/LeaveTypeSummary" },
  })
  byType: {
    [key in LeaveType]: LeaveTypeSummary;
  };
}
