import { Injectable } from '@nestjs/common';
import type { PortfolioAvailability } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { UpdateAvailabilityDto } from './dto/update-availability.dto';

const AVAILABILITY_ID = 1;

@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  async getAvailability() {
    const availability = await this.prisma.portfolioAvailability.upsert({
      where: {
        id: AVAILABILITY_ID,
      },
      create: {
        id: AVAILABILITY_ID,
      },
      update: {},
    });

    return this.toResponse(availability);
  }

  async updateAvailability(input: UpdateAvailabilityDto) {
    const currentAvailability = await this.prisma.portfolioAvailability.upsert({
      where: {
        id: AVAILABILITY_ID,
      },
      create: {
        id: AVAILABILITY_ID,
      },
      update: {},
    });
    const availableForCollaboration =
      input.availableForCollaboration ??
      currentAvailability.availableForCollaboration;
    const availableFrom = availableForCollaboration
      ? null
      : input.availableFrom === undefined
        ? currentAvailability.availableFrom
        : this.parseDate(input.availableFrom);

    const availability = await this.prisma.portfolioAvailability.update({
      where: {
        id: AVAILABILITY_ID,
      },
      data: {
        availableForCollaboration,
        availableFrom,
      },
    });

    return this.toResponse(availability);
  }

  private parseDate(value: string | null): Date | null {
    return value ? new Date(`${value}T00:00:00.000Z`) : null;
  }

  private toResponse(availability: PortfolioAvailability) {
    return {
      availableForCollaboration: availability.availableForCollaboration,
      availableFrom:
        availability.availableFrom?.toISOString().slice(0, 10) ?? null,
      updatedAt: availability.updatedAt,
    };
  }
}
