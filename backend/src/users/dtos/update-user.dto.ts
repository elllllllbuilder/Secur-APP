import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsUrl({ require_tld: false }, { message: 'photoUrl deve ser uma URL válida.' })
  photoUrl?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;
}
