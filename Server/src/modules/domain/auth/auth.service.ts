import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import { RedisService } from "../../infrastructure/redis/redis.service";
import { LoginDto } from "../dto/login.dto";
import { User, UserRole, AuthResponse } from "../entities/user.entity";

@Injectable()
export class AuthService {
  constructor(
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const userId = await this.redisService.hget<string>("user_emails", email);
    if (!userId) {
      return null;
    }

    const user = await this.redisService.hget<User>("users", userId);
    if (!user || user.password !== password) {
      return null;
    }

    return user;
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  async findUserById(id: string): Promise<User | null> {
    return await this.redisService.hget<User>("users", id);
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const userId = await this.redisService.hget<string>("user_emails", email);
    if (!userId) {
      return null;
    }
    return await this.redisService.hget<User>("users", userId);
  }
}
