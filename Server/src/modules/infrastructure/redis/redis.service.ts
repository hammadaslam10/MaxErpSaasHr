import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const redisConfig = {
      host: this.configService.get("REDIS_HOST", "localhost"),
      port: this.configService.get("REDIS_PORT", 6379),
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
    };

    const password = this.configService.get("REDIS_PASSWORD");
    if (password) {
      redisConfig["password"] = password;
    }

    this.client = new Redis(redisConfig);

    this.client.on("connect", () => {
      console.log("🔗 Connected to Redis");
    });

    this.client.on("ready", () => {
      console.log("✅ Redis is ready");
    });

    this.client.on("error", (err) => {
      console.error("❌ Redis connection error:", err);
    });

    this.client.on("close", () => {
      console.log("🔌 Redis connection closed");
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  getClient(): Redis {
    return this.client;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const serializedValue = JSON.stringify(value);
    if (ttl) {
      await this.client.setex(key, ttl, serializedValue);
    } else {
      await this.client.set(key, serializedValue);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  async keys(pattern: string): Promise<string[]> {
    return await this.client.keys(pattern);
  }

  async hset(key: string, field: string, value: any): Promise<void> {
    const serializedValue = JSON.stringify(value);
    await this.client.hset(key, field, serializedValue);
  }

  async hget<T>(key: string, field: string): Promise<T | null> {
    const value = await this.client.hget(key, field);
    if (!value) return null;

    try {
      return JSON.parse(value);
    } catch (error) {
      // For simple string values (like user IDs), return as string
      return value as T;
    }
  }

  async hgetall(key: string): Promise<Record<string, any>> {
    const hash = await this.client.hgetall(key);
    const result: Record<string, any> = {};

    for (const [field, value] of Object.entries(hash)) {
      try {
        result[field] = JSON.parse(value);
      } catch {
        result[field] = value;
      }
    }

    return result;
  }

  async hdel(key: string, field: string): Promise<void> {
    await this.client.hdel(key, field);
  }

  async sadd(key: string, ...members: string[]): Promise<void> {
    await this.client.sadd(key, ...members);
  }

  async smembers(key: string): Promise<string[]> {
    return await this.client.smembers(key);
  }

  async srem(key: string, ...members: string[]): Promise<void> {
    await this.client.srem(key, ...members);
  }
}
