import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CheckoutBoletoDto {
  @IsNotEmpty() @IsString()
  planId!: string;

  @IsOptional() @IsString()
  categoryId?: string;
}
