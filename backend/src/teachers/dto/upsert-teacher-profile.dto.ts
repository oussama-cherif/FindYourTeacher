import {
  IsOptional,
  IsString,
  IsArray,
  MaxLength,
  ArrayMinSize,
} from 'class-validator';

export class UpsertTeacherProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  languages: string[];

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  audienceTypes: string[];
}
