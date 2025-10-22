import { ApiProperty } from "@nestjs/swagger";

export enum UserRole {
  EMPLOYEE = "EMPLOYEE",
  MANAGER = "MANAGER",
}

export class LeaveBalance {
  @ApiProperty({ description: "Annual leave balance", example: 20 })
  annual: number;

  @ApiProperty({ description: "Sick leave balance", example: 10 })
  sick: number;

  @ApiProperty({ description: "Personal leave balance", example: 5 })
  personal: number;
}

export class User {
  @ApiProperty({
    description: "User ID",
    example: "fec0f159-72fc-4df8-a5bf-f659b0addf5c",
  })
  id: string;

  @ApiProperty({ description: "User email", example: "john.doe@company.com" })
  email: string;

  @ApiProperty({ description: "User password" })
  password: string;

  @ApiProperty({ description: "User full name", example: "John Doe" })
  name: string;

  @ApiProperty({
    description: "User role",
    enum: UserRole,
    example: UserRole.EMPLOYEE,
  })
  role: UserRole;

  @ApiProperty({ description: "User department", example: "Engineering" })
  department: string;

  @ApiProperty({ description: "Leave balance", type: LeaveBalance })
  leaveBalance: LeaveBalance;

  @ApiProperty({
    description: "Account creation date",
    example: "2024-01-01T00:00:00.000Z",
  })
  createdAt: string;
}

export class CreateUserDto {
  @ApiProperty({ description: "User email", example: "john.doe@company.com" })
  email: string;

  @ApiProperty({ description: "User password", example: "password123" })
  password: string;

  @ApiProperty({ description: "User full name", example: "John Doe" })
  name: string;

  @ApiProperty({
    description: "User role",
    enum: UserRole,
    example: UserRole.EMPLOYEE,
  })
  role: UserRole;

  @ApiProperty({ description: "User department", example: "Engineering" })
  department: string;

  @ApiProperty({ description: "Leave balance", type: LeaveBalance })
  leaveBalance: LeaveBalance;
}

export class LoginDto {
  @ApiProperty({ description: "User email", example: "john.doe@company.com" })
  email: string;

  @ApiProperty({ description: "User password", example: "password123" })
  password: string;
}

export class AuthResponse {
  @ApiProperty({
    description: "User information (without password)",
    type: User,
  })
  user: Omit<User, "password">;

  @ApiProperty({
    description: "JWT access token",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  token: string;
}
