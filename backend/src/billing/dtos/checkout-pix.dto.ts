import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CheckoutPixDto {
  @IsNotEmpty() @IsString()
  planId!: string;

  @IsOptional() @IsString()
  categoryId?: string;
}
