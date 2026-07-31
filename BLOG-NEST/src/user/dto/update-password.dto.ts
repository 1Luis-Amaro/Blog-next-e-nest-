// ==========================================
// DTO - Data Transfer Object (Objeto de Transferência de Dados)
// ==========================================
// O DTO define a ESTRUTURA dos dados que o cliente DEVE enviar.
//
// Neste caso: DTO para ALTERAR a senha do usuário
// O cliente precisa enviar:
// 1. currentPassword (senha atual) → para verificar se é o dono da conta
// 2. newPassword (nova senha) → a nova senha que o usuário quer usar
//
// Por que precisa da senha atual?
// - Segurança: só o dono da conta pode mudar a senha
// - Verificação: confirma que o usuário sabe a senha antiga
// ==========================================

import { IsNotEmpty, IsString, MinLength } from 'class-validator'; // Importa decorators de validação

export class UpdatePasswordDto {
  // Define o DTO para atualizar senha

  // ==========================================
  // CAMPO: currentPassword (Senha atual)
  // ==========================================

  @IsString({ message: 'Senha precisa ser uma String' }) // Valida: deve ser string
  @IsNotEmpty({ message: 'Senha não pode estar vazia' }) // Valida: não pode ser vazia
  currentPassword: string; // Senha atual do usuário (string, obrigatório)

  // ==========================================
  // CAMPO: newPassword (Nova senha)
  // ==========================================

  @IsString({ message: 'Nova senha precisa ser uma String' }) // Valida: deve ser string
  @IsNotEmpty({ message: 'Nova senha não pode estar vazia' }) // Valida: não pode ser vazia
  @MinLength(6, { message: 'Nova senha deve ter um mínimo de 6 caracteres' }) // Valida: mínimo 6 caracteres
  newPassword: string; // Nova senha do usuário (string, obrigatório, mínimo 6 caracteres)
}
