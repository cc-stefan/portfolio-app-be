import { Test, type TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { AvailabilityService } from './availability.service';

describe('AvailabilityService', () => {
  let service: AvailabilityService;
  const prismaService = {
    portfolioAvailability: {
      upsert: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvailabilityService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    service = module.get(AvailabilityService);
  });

  it('returns the default availability without requiring prior setup', async () => {
    prismaService.portfolioAvailability.upsert.mockResolvedValue({
      id: 1,
      availableForCollaboration: true,
      availableFrom: null,
      updatedAt: new Date('2026-07-26T12:00:00.000Z'),
    });

    await expect(service.getAvailability()).resolves.toEqual({
      availableForCollaboration: true,
      availableFrom: null,
      updatedAt: new Date('2026-07-26T12:00:00.000Z'),
    });
  });

  it('stores the date when collaboration is unavailable', async () => {
    prismaService.portfolioAvailability.upsert.mockResolvedValue({
      id: 1,
      availableForCollaboration: true,
      availableFrom: null,
      updatedAt: new Date('2026-07-26T12:00:00.000Z'),
    });
    prismaService.portfolioAvailability.update.mockResolvedValue({
      id: 1,
      availableForCollaboration: false,
      availableFrom: new Date('2026-09-01T00:00:00.000Z'),
      updatedAt: new Date('2026-07-26T12:05:00.000Z'),
    });

    await expect(
      service.updateAvailability({
        availableForCollaboration: false,
        availableFrom: '2026-09-01',
      }),
    ).resolves.toEqual({
      availableForCollaboration: false,
      availableFrom: '2026-09-01',
      updatedAt: new Date('2026-07-26T12:05:00.000Z'),
    });
    expect(prismaService.portfolioAvailability.update).toHaveBeenCalledWith({
      where: {
        id: 1,
      },
      data: {
        availableForCollaboration: false,
        availableFrom: new Date('2026-09-01T00:00:00.000Z'),
      },
    });
  });

  it('clears the return date when collaboration becomes available', async () => {
    prismaService.portfolioAvailability.upsert.mockResolvedValue({
      id: 1,
      availableForCollaboration: false,
      availableFrom: new Date('2026-09-01T00:00:00.000Z'),
      updatedAt: new Date('2026-07-26T12:00:00.000Z'),
    });
    prismaService.portfolioAvailability.update.mockResolvedValue({
      id: 1,
      availableForCollaboration: true,
      availableFrom: null,
      updatedAt: new Date('2026-07-26T12:05:00.000Z'),
    });

    await service.updateAvailability({
      availableForCollaboration: true,
      availableFrom: '2026-09-01',
    });

    expect(prismaService.portfolioAvailability.update).toHaveBeenCalledWith({
      where: {
        id: 1,
      },
      data: {
        availableForCollaboration: true,
        availableFrom: null,
      },
    });
  });
});
