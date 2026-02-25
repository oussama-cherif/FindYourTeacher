import { IsUUID, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class BuyCreditsDto {
  @IsUUID()
  groupId: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(4)
  credits: number;
}
