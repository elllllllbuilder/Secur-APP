import { IsOptional, IsString } from 'class-validator';

export class UpdateMeDto {
  @IsOptional() @IsString()
  name?: string;

  @IsOptional() @IsString()
  phone?: string;

  @IsOptional() @IsString()
  photoUrl?: string;

  // permite trocar categoria (validamos no service)
  @IsOptional() @IsString()
  categoryId?: string;
}
