import { Module } from "@nestjs/common";

import { LeaveController } from "./leave.controller";
import { LeaveService } from "./leave.service";

@Module({
  providers: [LeaveService],
  controllers: [LeaveController],
  exports: [LeaveService],
})
export class LeaveModule {}
