import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsString, IsOptional, MinLength } from "class-validator";

import { LeaveStatus } from "../entities/leave-request.entity";

export class UpdateLeaveRequestDto {
  @ApiProperty({
    description: "New status for the leave request",
    enum: LeaveStatus,
    example: LeaveStatus.APPROVED,
  })
  @IsEnum(LeaveStatus)
  status: LeaveStatus;

  @ApiPropertyOptional({
    description: "Optional comments from the manager",
    example: "Approved for family vacation",
    minLength: 5,
    type: String,
  })
  @IsString()
  @IsOptional()
  @MinLength(5)
  comments?: string;
}
