import { UserRole } from '@prisma/client';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { resolvePagination } from '../common/pagination';
import {
  InquiryResponseDto,
  InquirySummaryResponseDto,
  PaginatedInquiryResponseDto,
} from './dto/inquiry-response.dto';
import { UpdateInquiryDto } from './dto/update-inquiry.dto';
import { InquiriesService } from './inquiries.service';

@ApiTags('inquiries')
@ApiExtraModels(InquiryResponseDto, PaginatedInquiryResponseDto)
@Controller('admin/inquiries')
@Roles(UserRole.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminInquiriesController {
  constructor(private readonly inquiriesService: InquiriesService) {}

  @Get()
  @ApiOkResponse({
    schema: {
      oneOf: [
        {
          type: 'array',
          items: { $ref: getSchemaPath(InquiryResponseDto) },
        },
        { $ref: getSchemaPath(PaginatedInquiryResponseDto) },
      ],
    },
  })
  findAll(@Query() query: PaginationQueryDto) {
    return this.inquiriesService.findAllAdmin(
      resolvePagination(query.page, query.pageSize, 8),
    );
  }

  @Get('summary')
  @ApiOkResponse({ type: InquirySummaryResponseDto })
  getSummary() {
    return this.inquiriesService.getAdminSummary();
  }

  @Get(':id')
  @ApiOkResponse({ type: InquiryResponseDto })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.inquiriesService.findOneAdmin(id);
  }

  @Patch(':id')
  @ApiOkResponse({ type: InquiryResponseDto })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateInquiryDto: UpdateInquiryDto,
  ) {
    return this.inquiriesService.updateAdmin(id, updateInquiryDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.inquiriesService.removeAdmin(id);
  }
}
