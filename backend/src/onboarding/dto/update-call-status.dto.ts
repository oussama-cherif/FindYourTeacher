import { IsIn } from 'class-validator';

export class UpdateCallStatusDto {
  @IsIn(['CONFIRMED', 'CANCELLED', 'DONE'])
  status: 'CONFIRMED' | 'CANCELLED' | 'DONE';
}
