import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AdminService } from './admin.service';

describe('AdminService', () => {
  let service: AdminService;
  const prismaService = {
    project: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    user: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    inquiry: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    service = module.get(AdminService);
  });

  it('returns dashboard stats and recent activity for the admin dashboard', async () => {
    const recentProjects = [
      {
        id: '99690f9a-4fdd-4334-bfea-8d09aef08103',
        slug: 'portfolio-backend',
        published: true,
        featured: true,
        imageUrl: '/uploads/project-images/portfolio-backend.png',
        createdAt: new Date('2026-04-25T09:00:00.000Z'),
        updatedAt: new Date('2026-04-26T09:00:00.000Z'),
        translations: [
          {
            locale: 'en',
            title: 'Portfolio Backend',
            summary: 'API summary',
            description: null,
          },
        ],
      },
    ];
    const recentUsers = [
      {
        id: 'd47e7488-c1d8-4e2d-ac28-a4326b32e1c7',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN,
        createdAt: new Date('2026-04-24T09:00:00.000Z'),
        updatedAt: new Date('2026-04-25T09:00:00.000Z'),
      },
    ];
    const recentInquiries = [
      {
        id: '4655853c-01a8-46f7-a685-cd45e6b2f3bd',
        name: 'Jane Doe',
        email: 'jane@example.com',
        message: 'I would like to discuss a frontend project.',
        status: 'NEW',
        isRead: false,
        adminNotes: null,
        createdAt: new Date('2026-04-27T09:00:00.000Z'),
        updatedAt: new Date('2026-04-27T09:00:00.000Z'),
      },
    ];

    prismaService.project.count
      .mockResolvedValueOnce(4)
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(1);
    prismaService.user.count.mockResolvedValueOnce(5).mockResolvedValueOnce(2);
    prismaService.inquiry.count
      .mockResolvedValueOnce(6)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(3);
    prismaService.project.findMany.mockResolvedValue(recentProjects);
    prismaService.user.findMany.mockResolvedValue(recentUsers);
    prismaService.inquiry.findMany.mockResolvedValue(recentInquiries);

    const result = await service.getDashboardOverview();

    expect(prismaService.project.count).toHaveBeenNthCalledWith(1);
    expect(prismaService.project.count).toHaveBeenNthCalledWith(2, {
      where: {
        published: true,
      },
    });
    expect(prismaService.project.count).toHaveBeenNthCalledWith(3, {
      where: {
        featured: true,
      },
    });
    expect(prismaService.project.count).toHaveBeenNthCalledWith(4, {
      where: {
        imageUrl: {
          not: null,
        },
      },
    });
    expect(prismaService.user.count).toHaveBeenNthCalledWith(1);
    expect(prismaService.user.count).toHaveBeenNthCalledWith(2, {
      where: {
        role: UserRole.ADMIN,
      },
    });
    expect(prismaService.inquiry.count).toHaveBeenNthCalledWith(1);
    expect(prismaService.inquiry.count).toHaveBeenNthCalledWith(2, {
      where: {
        isRead: false,
      },
    });
    expect(prismaService.inquiry.count).toHaveBeenNthCalledWith(3, {
      where: {
        status: 'IN_REVIEW',
      },
    });
    expect(prismaService.inquiry.count).toHaveBeenNthCalledWith(4, {
      where: {
        status: 'RESOLVED',
      },
    });
    expect(prismaService.project.findMany).toHaveBeenCalledWith({
      take: 5,
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        slug: true,
        published: true,
        featured: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
        translations: {
          select: {
            locale: true,
            title: true,
            summary: true,
            description: true,
          },
          orderBy: {
            locale: 'asc',
          },
        },
      },
    });
    expect(prismaService.user.findMany).toHaveBeenCalledWith({
      take: 5,
      orderBy: [{ createdAt: 'desc' }, { updatedAt: 'desc' }],
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    expect(prismaService.inquiry.findMany).toHaveBeenCalledWith({
      take: 5,
      orderBy: [{ createdAt: 'desc' }, { updatedAt: 'desc' }],
      select: {
        id: true,
        name: true,
        email: true,
        message: true,
        status: true,
        isRead: true,
        adminNotes: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    expect(result.generatedAt).toBeInstanceOf(Date);
    expect(result.stats).toEqual({
      totalProjects: 4,
      publishedProjects: 3,
      draftProjects: 1,
      featuredProjects: 2,
      projectsWithImages: 1,
      totalUsers: 5,
      adminUsers: 2,
      regularUsers: 3,
      totalInquiries: 6,
      unreadInquiries: 2,
      inReviewInquiries: 1,
      resolvedInquiries: 3,
    });
    expect(result.recentProjects).toEqual(recentProjects);
    expect(result.recentUsers).toEqual(recentUsers);
    expect(result.recentInquiries).toEqual(recentInquiries);
  });
});
