import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CheckoutCardDto {
  @IsNotEmpty() @IsString()
  planId!: string;

  @IsOptional() @IsString()
  categoryId?: string;

  @IsNotEmpty() @IsString()
  card_number!: string;

  @IsNotEmpty() @IsString()
  card_holder_name!: string;

  @IsNotEmpty() @IsString()
  card_expiration_date!: string; // MMYY

  @IsNotEmpty() @IsString()
  card_cvv!: string;
}
