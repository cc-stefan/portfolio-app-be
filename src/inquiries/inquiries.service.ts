import { Injectable, NotFoundException } from '@nestjs/common';
import { Inquiry, InquiryStatus, Prisma } from '@prisma/client';
import {
  createPaginationMetadata,
  getPaginationDatabaseArgs,
  type PaginatedResult,
  type PaginationParams,
} from '../common/pagination';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { UpdateInquiryDto } from './dto/update-inquiry.dto';

const inquiryOrderBy: Prisma.InquiryOrderByWithRelationInput[] = [
  {
    isRead: 'asc',
  },
  {
    status: 'asc',
  },
  {
    createdAt: 'desc',
  },
];

@Injectable()
export class InquiriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createInquiryDto: CreateInquiryDto) {
    const inquiry = await this.prisma.inquiry.create({
      data: {
        name: createInquiryDto.name,
        email: createInquiryDto.email,
        message: createInquiryDto.message,
      },
    });

    return {
      id: inquiry.id,
      receivedAt: inquiry.createdAt.toISOString(),
    };
  }

  async findAllAdmin(
    pagination?: PaginationParams | null,
  ): Promise<Inquiry[] | PaginatedResult<Inquiry>> {
    const query = {
      orderBy: inquiryOrderBy,
    } satisfies Prisma.InquiryFindManyArgs;

    if (!pagination) {
      return this.prisma.inquiry.findMany(query);
    }

    const [items, totalItems] = await Promise.all([
      this.prisma.inquiry.findMany({
        ...query,
        ...getPaginationDatabaseArgs(pagination),
      }),
      this.prisma.inquiry.count(),
    ]);

    return {
      items,
      pagination: createPaginationMetadata(pagination, totalItems),
    };
  }

  async getAdminSummary() {
    const [total, unread, inReview, resolved] = await Promise.all([
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
    ]);

    return {
      total,
      unread,
      inReview,
      resolved,
    };
  }

  async findOneAdmin(id: string): Promise<Inquiry> {
    const inquiry = await this.prisma.inquiry.findUnique({
      where: {
        id,
      },
    });

    if (!inquiry) {
      throw new NotFoundException('Inquiry not found');
    }

    return inquiry;
  }

  async updateAdmin(
    id: string,
    updateInquiryDto: UpdateInquiryDto,
  ): Promise<Inquiry> {
    const existingInquiry = await this.findOneAdmin(id);
    const data: Prisma.InquiryUpdateInput = {};

    if (updateInquiryDto.status !== undefined) {
      data.status = updateInquiryDto.status;
    }

    if (updateInquiryDto.isRead !== undefined) {
      data.isRead = updateInquiryDto.isRead;
    }

    if (updateInquiryDto.adminNotes !== undefined) {
      data.adminNotes =
        typeof updateInquiryDto.adminNotes === 'string' &&
        updateInquiryDto.adminNotes.length > 0
          ? updateInquiryDto.adminNotes
          : null;
    }

    if (Object.keys(data).length === 0) {
      return existingInquiry;
    }

    try {
      return await this.prisma.inquiry.update({
        where: {
          id,
        },
        data,
      });
    } catch (error) {
      this.handleInquiryPersistenceError(error);
    }
  }

  async removeAdmin(id: string): Promise<void> {
    await this.findOneAdmin(id);

    try {
      await this.prisma.inquiry.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      this.handleInquiryPersistenceError(error);
    }
  }

  private handleInquiryPersistenceError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundException('Inquiry not found');
    }

    throw error;
  }
}
