import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AuthModule } from "./domain/auth/auth.module";
import { LeaveModule } from "./domain/leave/leave.module";
import { RedisModule } from "./infrastructure/redis/redis.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    RedisModule,
    AuthModule,
    LeaveModule,
  ],
})
export class AppModule {}
