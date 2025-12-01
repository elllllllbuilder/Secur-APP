import { IsOptional, IsString } from 'class-validator';

export class AttachDto {
  @IsOptional()
  @IsString()
  code?: string; // ex.: "BOLETIM", "ATESTADO", "NF", "FOTO"
}
