import { IsIn } from 'class-validator';

export class UpdateCallStatusDto {
  @IsIn(['CONFIRMED', 'CANCELLED'])
  status: 'CONFIRMED' | 'CANCELLED';
}
