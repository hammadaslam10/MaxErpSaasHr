import { ApiProperty } from "@nestjs/swagger";
import {
  IsEnum,
  IsString,
  IsDateString,
  IsNotEmpty,
  MinLength,
} from "class-validator";

import { LeaveType } from "../entities/leave-request.entity";

export class CreateLeaveRequestDto {
  @ApiProperty({
    description: "Type of leave request",
    enum: LeaveType,
    example: LeaveType.ANNUAL,
  })
  @IsEnum(LeaveType)
  @IsNotEmpty()
  type: LeaveType;

  @ApiProperty({
    description: "Start date of leave (YYYY-MM-DD format)",
    example: "2024-02-15",
    type: String,
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({
    description: "End date of leave (YYYY-MM-DD format)",
    example: "2024-02-16",
    type: String,
  })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({
    description: "Reason for leave request",
    example: "Family vacation",
    minLength: 10,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  reason: string;
}
