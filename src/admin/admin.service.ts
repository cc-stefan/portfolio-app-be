import { Injectable } from '@nestjs/common';
import { InquiryStatus, Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { projectTranslationSelect } from '../projects/project-records';

const recentProjectsSelect = {
  id: true,
  slug: true,
  published: true,
  featured: true,
  imageUrl: true,
  createdAt: true,
  updatedAt: true,
  translations: {
    select: projectTranslationSelect,
    orderBy: {
      locale: 'asc',
    },
  },
} satisfies Prisma.ProjectSelect;

const recentUsersSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

const recentInquiriesSelect = {
  id: true,
  name: true,
  email: true,
  message: true,
  status: true,
  isRead: true,
  adminNotes: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.InquirySelect;

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardOverview() {
    const [
      totalProjects,
      publishedProjects,
      featuredProjects,
      projectsWithImages,
      totalUsers,
      adminUsers,
      totalInquiries,
      unreadInquiries,
      inReviewInquiries,
      resolvedInquiries,
      recentProjects,
      recentUsers,
      recentInquiries,
    ] = await Promise.all([
      this.prisma.project.count(),
      this.prisma.project.count({
        where: {
          published: true,
        },
      }),
      this.prisma.project.count({
        where: {
          featured: true,
        },
      }),
      this.prisma.project.count({
        where: {
          imageUrl: {
            not: null,
          },
        },
      }),
      this.prisma.user.count(),
      this.prisma.user.count({
        where: {
          role: UserRole.ADMIN,
        },
      }),
      this.prisma.inquiry.count(),
      this.prisma.inquiry.count({
        where: {
          isRead: false,
        },
      }),
      this.prisma.inquiry.count({
        where: {
          status: InquiryStatus.IN_REVIEW,
        },
      }),
      this.prisma.inquiry.count({
        where: {
          status: InquiryStatus.RESOLVED,
        },
      }),
      this.prisma.project.findMany({
        take: 5,
        orderBy: [
          {
            updatedAt: 'desc',
          },
          {
            createdAt: 'desc',
          },
        ],
        select: recentProjectsSelect,
      }),
      this.prisma.user.findMany({
        take: 5,
        orderBy: [
          {
            createdAt: 'desc',
          },
          {
            updatedAt: 'desc',
          },
        ],
        select: recentUsersSelect,
      }),
      this.prisma.inquiry.findMany({
        take: 5,
        orderBy: [
          {
            createdAt: 'desc',
          },
          {
            updatedAt: 'desc',
          },
        ],
        select: recentInquiriesSelect,
      }),
    ]);

    return {
      generatedAt: new Date(),
      stats: {
        totalProjects,
        publishedProjects,
        draftProjects: totalProjects - publishedProjects,
        featuredProjects,
        projectsWithImages,
        totalUsers,
        adminUsers,
        regularUsers: totalUsers - adminUsers,
        totalInquiries,
        unreadInquiries,
        inReviewInquiries,
        resolvedInquiries,
      },
      recentProjects,
      recentUsers,
      recentInquiries,
    };
  }
}
