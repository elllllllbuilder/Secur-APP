import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CheckoutDto {
  @IsString()
  @IsNotEmpty()
  planId!: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @Matches(/^\d{13,19}$/, { message: 'Número do cartão inválido.' })
  card_number!: string;

  @IsString()
  @IsNotEmpty()
  card_holder_name!: string;

  @IsString()
  @Matches(/^\d{4}$/, { message: 'Validade deve ser MMYY.' })
  card_expiration_date!: string;

  @IsString()
  @Matches(/^\d{3,4}$/, { message: 'CVV inválido.' })
  card_cvv!: string;

  @IsString()
  @IsOptional()
  document_number?: string;

  @IsString()
  @IsOptional()
  email?: string;
}
