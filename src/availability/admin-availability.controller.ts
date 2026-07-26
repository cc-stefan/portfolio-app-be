import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AvailabilityService } from './availability.service';
import { AvailabilityResponseDto } from './dto/availability-response.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';

@ApiTags('admin availability')
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/availability')
export class AdminAvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Get()
  @ApiOkResponse({ type: AvailabilityResponseDto })
  getAvailability() {
    return this.availabilityService.getAvailability();
  }

  @Patch()
  @ApiOkResponse({ type: AvailabilityResponseDto })
  updateAvailability(@Body() updateAvailabilityDto: UpdateAvailabilityDto) {
    return this.availabilityService.updateAvailability(updateAvailabilityDto);
  }
}
