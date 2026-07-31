// ==========================================
// DTO - Data Transfer Object (Objeto de Transferência de Dados)
// ==========================================
// O DTO define a ESTRUTURA dos dados que serão ENVIADOS para o cliente.
//
// Neste caso: DTO para RESPONDER com os dados do usuário
//
// Por que usar um DTO de resposta?
// 1. SEGURANÇA: Não enviar dados sensíveis (ex: password, forceLogout)
// 2. CONTROLE: Escolher exatamente quais campos enviar
// 3. ORGANIZAÇÃO: Formatar os dados antes de enviar
// 4. CONSISTÊNCIA: Sempre a mesma estrutura de resposta
//
// Diferença do CreateUserDto:
// - CreateUserDto: O que o cliente ENVIA (entrada)
// - UserResponseDto: O que o cliente RECEBE (saída)
// ==========================================

import { User } from 'src/user/entities/user.entity'; // Importa a entidade User (tem todos os campos do banco)

export class UserResponseDto {
  // Define o DTO de resposta para usuário

  // ==========================================
  // CAMPOS QUE SERÃO ENVIADOS PARA O CLIENTE
  // ==========================================

  readonly id: string; // ID do usuário (string, somente leitura)

  readonly name: string; // Nome do usuário (string, somente leitura)

  readonly email: string; // Email do usuário (string, somente leitura)

  readonly createdAt: Date; // Data de criação (Date, somente leitura)

  readonly updatedAt: Date; // Data de atualização (Date, somente leitura)

  // ==========================================
  // ⚠️ CAMPOS QUE NÃO ESTÃO AQUI (OCULTADOS):
  // ==========================================
  // ❌ password → Não enviado por segurança!
  // ❌ forceLogout → Não enviado (dado interno)
  // ❌ Qualquer outro campo que não queremos expor

  // ==========================================
  // CONSTRUTOR - Cria o DTO a partir de um User
  // ==========================================

  constructor(user: User) {
    // Recebe um objeto User (do banco)
    this.id = user.id; // Copia o ID
    this.name = user.name; // Copia o nome
    this.email = user.email; // Copia o email
    this.createdAt = user.createdAt; // Copia a data de criação
    this.updatedAt = user.updatedAt; // Copia a data de atualização
    // ✅ password NÃO é copiado (segurança!)
    // ✅ forceLogout NÃO é copiado (dado interno!)
  }
}

// ==========================================
// COMPARAÇÃO: ENTIDADE vs DTO
// ==========================================

// User (Entidade - o que está no banco):
// {
//   id: "f102b1c6-...",
//   name: "João Silva",
//   email: "joao@email.com",
//   password: "$2b$10$...",     // ⚠️ SENHA (não deve ser enviada)
//   forceLogout: false,          // ⚠️ DADO INTERNO
//   createdAt: "2026-01-01T12:00:00.000Z",
//   updatedAt: "2026-01-01T12:00:00.000Z"
// }

// UserResponseDto (Resposta - o que o cliente recebe):
// {
//   id: "f102b1c6-...",
//   name: "João Silva",
//   email: "joao@email.com",
//   createdAt: "2026-01-01T12:00:00.000Z",
//   updatedAt: "2026-01-01T12:00:00.000Z"
// }
// ✅ password removido (segurança!)
// ✅ forceLogout removido (dado interno)
// =========================================
