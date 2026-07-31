import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'E-mail inválido' })
  email: string;

  @IsString({ message: 'Senha precisa ser uma String' })
  @IsNotEmpty({ message: 'Senha não pode estar vazia' })
  password: string;
}
