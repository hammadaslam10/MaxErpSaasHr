import Redis from "ioredis";
import { v4 as uuidv4 } from "uuid";

// User interface
interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: "EMPLOYEE" | "MANAGER";
  department: string;
  leaveBalance: {
    annual: number;
    sick: number;
    personal: number;
  };
  createdAt: string;
}

// Leave Request interface
interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  type: "ANNUAL" | "SICK" | "PERSONAL";
  startDate: string;
  endDate: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  appliedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  comments?: string;
}

// Mock data
const mockUsers: Omit<User, "id" | "createdAt">[] = [
  {
    email: "john.doe@company.com",
    password: "password123", // In real app, this would be hashed
    name: "John Doe",
    role: "EMPLOYEE",
    department: "Engineering",
    leaveBalance: { annual: 20, sick: 10, personal: 5 },
  },
  {
    email: "jane.smith@company.com",
    password: "password123",
    name: "Jane Smith",
    role: "EMPLOYEE",
    department: "Marketing",
    leaveBalance: { annual: 18, sick: 8, personal: 3 },
  },
  {
    email: "mike.johnson@company.com",
    password: "password123",
    name: "Mike Johnson",
    role: "MANAGER",
    department: "Engineering",
    leaveBalance: { annual: 25, sick: 12, personal: 7 },
  },
  {
    email: "sarah.wilson@company.com",
    password: "password123",
    name: "Sarah Wilson",
    role: "MANAGER",
    department: "Marketing",
    leaveBalance: { annual: 22, sick: 10, personal: 5 },
  },
  {
    email: "alex.brown@company.com",
    password: "password123",
    name: "Alex Brown",
    role: "EMPLOYEE",
    department: "Sales",
    leaveBalance: { annual: 15, sick: 6, personal: 2 },
  },
];

const mockLeaveRequests: Omit<LeaveRequest, "id" | "appliedAt">[] = [
  {
    employeeId: "", // Will be set dynamically
    employeeName: "John Doe",
    employeeEmail: "john.doe@company.com",
    type: "ANNUAL",
    startDate: "2024-02-15",
    endDate: "2024-02-16",
    reason: "Family vacation",
    status: "PENDING",
  },
  {
    employeeId: "", // Will be set dynamically
    employeeName: "Jane Smith",
    employeeEmail: "jane.smith@company.com",
    type: "SICK",
    startDate: "2024-01-20",
    endDate: "2024-01-20",
    reason: "Doctor appointment",
    status: "APPROVED",
    reviewedAt: "2024-01-19T10:30:00Z",
    reviewedBy: "mike.johnson@company.com",
  },
  {
    employeeId: "", // Will be set dynamically
    employeeName: "Alex Brown",
    employeeEmail: "alex.brown@company.com",
    type: "PERSONAL",
    startDate: "2024-02-01",
    endDate: "2024-02-02",
    reason: "Personal matters",
    status: "PENDING",
  },
];

async function seedDatabase() {
  const redis = new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD,
  });

  try {
    console.log("🌱 Starting database seeding...");

    // Clear existing data
    await redis.del("users");
    await redis.del("leave_requests");
    await redis.del("user_emails"); // For quick email lookup

    // Seed users
    const users: User[] = mockUsers.map((user) => ({
      ...user,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    }));

    for (const user of users) {
      await redis.hset("users", user.id, JSON.stringify(user));
      await redis.hset("user_emails", user.email, user.id);
    }

    console.log(`✅ Seeded ${users.length} users`);

    // Seed leave requests
    const leaveRequests: LeaveRequest[] = mockLeaveRequests.map(
      (request, index) => {
        // Find corresponding user ID
        const user = users.find((u) => u.email === request.employeeEmail);
        return {
          ...request,
          id: uuidv4(),
          employeeId: user?.id || "",
          appliedAt: new Date(
            Date.now() - index * 24 * 60 * 60 * 1000,
          ).toISOString(), // Stagger dates
        };
      },
    );

    for (const request of leaveRequests) {
      await redis.hset("leave_requests", request.id, JSON.stringify(request));
    }

    console.log(`✅ Seeded ${leaveRequests.length} leave requests`);

    // Create indexes for quick lookups
    await redis.sadd(
      "pending_requests",
      ...leaveRequests.filter((r) => r.status === "PENDING").map((r) => r.id),
    );

    // Create employee_requests set for all requests (for the getEmployeeRequests method)
    for (const request of leaveRequests) {
      await redis.sadd("employee_requests", request.id);
    }

    console.log("🎉 Database seeding completed successfully!");
    console.log("\n📊 Sample Data:");
    console.log("Users:");
    users.forEach((user) => {
      console.log(`  - ${user.name} (${user.role}) - ${user.email}`);
    });
    console.log("\nLeave Requests:");
    leaveRequests.forEach((request) => {
      console.log(
        `  - ${request.employeeName} - ${request.type} (${request.status})`,
      );
    });
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    await redis.quit();
  }
}

// Run seeder if called directly
if (require.main === module) {
  seedDatabase();
}

export { seedDatabase };
