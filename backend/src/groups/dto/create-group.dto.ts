import {
  IsString,
  IsInt,
  IsNumber,
  IsIn,
  Min,
  Max,
  MinLength,
  MaxLength,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateGroupDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsString()
  language: string;

  @IsIn(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])
  level: string;

  @IsIn(['kids', 'adults', 'workers', 'elderly'])
  audienceType: string;

  @Type(() => Number)
  @IsInt()
  @Min(2)
  @Max(30)
  maxStudents: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  @IsPositive()
  pricePerSession: number;
}
