import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetadataDto {
  @ApiProperty({ minimum: 1 })
  page: number;

  @ApiProperty({ minimum: 1 })
  pageSize: number;

  @ApiProperty({ minimum: 0 })
  totalItems: number;

  @ApiProperty({ minimum: 0 })
  totalPages: number;
}
