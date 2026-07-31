// ==========================================
// DTO - Data Transfer Object (Objeto de Transferência de Dados)
// ==========================================
// O DTO define a ESTRUTURA dos dados que o cliente DEVE enviar.
// Ele serve para:
// 1. Validar os dados antes de chegar no service
// 2. Garantir que os campos obrigatórios estão presentes
// 3. Definir os tipos (string, number, etc.)
// 4. Proteger a aplicação contra dados inválidos
//
// Neste caso: DTO para CRIAR um novo usuário
// O cliente precisa enviar: name, email, password
// ==========================================

import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator'; // Importa decorators de validação

export class CreateUserDto {
  // Define o DTO para criar usuário

  @IsString({ message: 'Nome precisa ser uma String' }) // Valida: deve ser string
  @IsNotEmpty({ message: 'Nome não pode estar vazio' }) // Valida: não pode ser vazio
  name: string; // Nome do usuário (string, obrigatório)

  @IsEmail({}, { message: 'E-mail inválido' }) // Valida: deve ser email válido (ex: email@dominio.com)
  email: string; // Email do usuário (string, obrigatório, formato email)

  @IsString({ message: 'Senha precisa ser uma String' }) // Valida: deve ser string
  @IsNotEmpty({ message: 'Senha não pode estar vazia' }) // Valida: não pode ser vazia
  @MinLength(6, { message: 'Senha deve ter um mínimo de 6 caracteres' }) // Valida: mínimo 6 caracteres
  password: string; // Senha do usuário (string, obrigatório, mínimo 6 caracteres)
}
