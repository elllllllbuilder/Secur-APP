import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

// ✅ Lista de valores em RUNTIME (nada de enum do Prisma aqui)
export const CASE_TYPES = [
  'SAUDE',
  'PANE_MECANICA',
  'ACIDENTE',
  'ROUBO_FURTO',
] as const;
export type CaseType = (typeof CASE_TYPES)[number];

// 🔎 loga quando o arquivo for carregado (confirma que este DTO está sendo usado)
console.log('[CreateSupportDto][LOAD] CASE_TYPES =', CASE_TYPES);

export class CreateSupportDto {
  @IsIn(CASE_TYPES, {
    message: 'TYPE INVÁLIDO (DTOv3). Use SAUDE, PANE_MECANICA, ACIDENTE ou ROUBO_FURTO',
  })
  type!: CaseType;

  @IsOptional()
  @IsString({ message: 'description deve ser texto' })
  @MaxLength(2000)
  description?: string;
}
