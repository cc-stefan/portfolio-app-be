import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, type TransformFnParams } from 'class-transformer';
import { IsBoolean, IsDateString, IsOptional } from 'class-validator';

function normalizeOptionalDate({ value }: TransformFnParams): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  return value.trim() || null;
}

export class UpdateAvailabilityDto {
  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  availableForCollaboration?: boolean;

  @ApiPropertyOptional({
    example: '2026-09-01',
    nullable: true,
    format: 'date',
  })
  @IsOptional()
  @Transform(normalizeOptionalDate)
  @IsDateString()
  availableFrom?: string | null;
}
