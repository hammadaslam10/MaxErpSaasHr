import { Test, TestingModule } from "@nestjs/testing";

import { RedisService } from "../../infrastructure/redis/redis.service";
import { LeaveType, LeaveStatus } from "../entities/leave-request.entity";
import { UserRole } from "../entities/user.entity";

import { LeaveService } from "./leave.service";

describe("LeaveService", () => {
  let service: LeaveService;
  let redisService: RedisService;

  const mockUser = {
    id: "user-1",
    email: "test@example.com",
    password: "password123",
    name: "Test User",
    role: UserRole.EMPLOYEE,
    department: "Engineering",
    leaveBalance: { annual: 20, sick: 10, personal: 5 },
    createdAt: new Date().toISOString(),
  };

  const mockCreateDto = {
    type: LeaveType.ANNUAL,
    startDate: "2024-02-15",
    endDate: "2024-02-16",
    reason: "Test leave request",
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeaveService,
        {
          provide: RedisService,
          useValue: {
            hget: jest.fn(),
            hset: jest.fn(),
            sadd: jest.fn(),
            smembers: jest.fn(),
            srem: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LeaveService>(LeaveService);
    redisService = module.get<RedisService>(RedisService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("validateLeaveRequest", () => {
    it("should throw error for past start date", async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const invalidDto = {
        ...mockCreateDto,
        startDate: pastDate.toISOString().split("T")[0],
      };

      // Mock Redis calls
      jest.spyOn(redisService, "hget").mockResolvedValue(mockUser);
      jest.spyOn(redisService, "smembers").mockResolvedValue([]);

      await expect(
        service.createLeaveRequest(invalidDto, mockUser),
      ).rejects.toThrow("Start date cannot be in the past");
    });

    it("should throw error when end date is before start date", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      const futureDateStr = futureDate.toISOString().split("T")[0];

      const invalidDto = {
        ...mockCreateDto,
        startDate: futureDateStr,
        endDate: new Date(futureDate.getTime() - 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0], // One day before
      };

      // Mock Redis calls
      jest.spyOn(redisService, "hget").mockResolvedValue(mockUser);
      jest.spyOn(redisService, "smembers").mockResolvedValue([]);

      await expect(
        service.createLeaveRequest(invalidDto, mockUser),
      ).rejects.toThrow("End date cannot be before start date");
    });

    it("should throw error for leave request exceeding 30 days", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      const futureDateStr = futureDate.toISOString().split("T")[0];

      const invalidDto = {
        ...mockCreateDto,
        startDate: futureDateStr,
        endDate: new Date(futureDate.getTime() + 35 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0], // 35 days later
      };

      // Mock Redis calls
      jest.spyOn(redisService, "hget").mockResolvedValue(mockUser);
      jest.spyOn(redisService, "smembers").mockResolvedValue([]);

      await expect(
        service.createLeaveRequest(invalidDto, mockUser),
      ).rejects.toThrow("Leave request cannot exceed 30 days");
    });
  });

  describe("checkLeaveBalance", () => {
    it("should throw error for insufficient leave balance", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      const futureDateStr = futureDate.toISOString().split("T")[0];

      const invalidDto = {
        ...mockCreateDto,
        type: LeaveType.ANNUAL,
        startDate: futureDateStr,
        endDate: new Date(futureDate.getTime() + 25 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0], // 25 days, but user only has 20 annual leave
      };

      // Mock Redis calls
      jest.spyOn(redisService, "hget").mockResolvedValue(mockUser);
      jest.spyOn(redisService, "smembers").mockResolvedValue([]);

      await expect(
        service.createLeaveRequest(invalidDto, mockUser),
      ).rejects.toThrow("Insufficient annual leave balance");
    });
  });
});
