import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AvailabilityService } from './availability.service';
import { AvailabilityResponseDto } from './dto/availability-response.dto';

@ApiTags('availability')
@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Get()
  @ApiOkResponse({ type: AvailabilityResponseDto })
  getAvailability() {
    return this.availabilityService.getAvailability();
  }
}
