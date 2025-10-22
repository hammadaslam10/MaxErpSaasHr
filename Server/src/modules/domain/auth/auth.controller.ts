import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from "@nestjs/swagger";

import { LoginDto } from "../dto/login.dto";
import { AuthResponse } from "../entities/user.entity";

import { AuthService } from "./auth.service";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "User login",
    description:
      "Authenticate user and return JWT token along with user information",
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: "Login successful",
    type: AuthResponse,
  })
  @ApiResponse({
    status: 401,
    description: "Invalid credentials",
    schema: {
      example: {
        statusCode: 401,
        message: "Invalid credentials",
        error: "Unauthorized",
      },
    },
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(loginDto);
  }

  @Get("test")
  @ApiOperation({ summary: "Test endpoint" })
  test() {
    return { message: "Auth controller is working" };
  }

  @Post("test-login")
  @ApiOperation({ summary: "Test login without validation" })
  async testLogin(@Body() body: any) {
    console.log("Test login received:", body);
    try {
      const result = await this.authService.login(body);
      console.log("Test login successful");
      return result;
    } catch (error) {
      console.error("Test login error:", error);
      return { error: error.message };
    }
  }
}
