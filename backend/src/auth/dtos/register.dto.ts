import { IsEmail, IsString, MinLength } from 'class-validator';
import { IsCPF } from '../../common/validators/cpf.validator';

export class RegisterDto {
  @IsString()
  @MinLength(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
  name!: string;

  @IsEmail({}, { message: 'E-mail inválido' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Senha deve ter pelo menos 6 caracteres' })
  password!: string;

  @IsString()
  @IsCPF({ message: 'CPF inválido' })
  cpf!: string;

  @IsString()
  phone?: string;
}
