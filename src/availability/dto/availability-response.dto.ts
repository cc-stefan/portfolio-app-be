import { ApiProperty } from '@nestjs/swagger';

export class AvailabilityResponseDto {
  @ApiProperty({ example: true })
  availableForCollaboration: boolean;

  @ApiProperty({
    example: '2026-09-01',
    nullable: true,
    format: 'date',
  })
  availableFrom: string | null;

  @ApiProperty({ example: '2026-07-26T12:00:00.000Z' })
  updatedAt: Date;
}
