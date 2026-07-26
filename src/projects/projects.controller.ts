import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { resolvePagination } from '../common/pagination';
import {
  ProjectListQueryDto,
  ProjectLocaleQueryDto,
} from './dto/project-query.dto';
import {
  PaginatedPublicProjectResponseDto,
  PublicProjectResponseDto,
} from './dto/project-response.dto';
import { ProjectsService } from './projects.service';

@ApiTags('projects')
@ApiExtraModels(PublicProjectResponseDto, PaginatedPublicProjectResponseDto)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOkResponse({
    schema: {
      oneOf: [
        {
          type: 'array',
          items: { $ref: getSchemaPath(PublicProjectResponseDto) },
        },
        { $ref: getSchemaPath(PaginatedPublicProjectResponseDto) },
      ],
    },
  })
  findAllPublished(@Query() query: ProjectListQueryDto) {
    return this.projectsService.findAllPublished(
      query.locale,
      resolvePagination(query.page, query.pageSize, 9),
    );
  }

  @Get(':slug')
  @ApiOkResponse({ type: PublicProjectResponseDto })
  findPublishedBySlug(
    @Param('slug') slug: string,
    @Query() query: ProjectLocaleQueryDto,
  ) {
    return this.projectsService.findPublishedBySlug(slug, query.locale);
  }
}
