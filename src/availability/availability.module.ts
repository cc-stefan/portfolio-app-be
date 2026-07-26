import { Module } from '@nestjs/common';
import { AdminAvailabilityController } from './admin-availability.controller';
import { AvailabilityController } from './availability.controller';
import { AvailabilityService } from './availability.service';

@Module({
  controllers: [AvailabilityController, AdminAvailabilityController],
  providers: [AvailabilityService],
})
export class AvailabilityModule {}
