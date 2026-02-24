import {
  IsUUID,
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class BookCallDto {
  @IsUUID()
  teacherId: string;

  @IsUUID()
  slotId: string;

  @IsDateString()
  scheduledAt: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  studentNotes?: string;
}
