import { IsOptional, IsString } from 'class-validator';

export class CreateCheckoutDto {
  @IsString()
  plan_id: string;

  @IsOptional()
  @IsString()
  success_url?: string;

  @IsOptional()
  @IsString()
  fail_url?: string;
}
