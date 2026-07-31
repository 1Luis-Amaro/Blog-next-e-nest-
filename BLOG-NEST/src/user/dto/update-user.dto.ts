import { OmitType, PartialType } from '@nestjs/mapped-types';
//       ↑            ↑
//       |            └── Torna todos os campos OPCIONAIS
//       └── Remove (omite) campos especificados

import { CreateUserDto } from './create-user.dto';
//         ↑
//         DTO original que tem: name, email, password (todos obrigatórios)

export class UpdateUserDto extends PartialType(
  //     ↑                    ↑
  //     |                    └── Herda e transforma o DTO passado como parâmetro
  //     └── Nome do novo DTO

  OmitType(CreateUserDto, ['password']),
  // ↑                         ↑
  // |                         └── Lista de campos para REMOVER
  // └── Remove o campo 'password' do CreateUserDto
) {}
// Resultado final:
// UpdateUserDto = {
//   name?: string;  // Opcional (do PartialType)
//   email?: string; // Opcional (do PartialType)
//   // password foi removido (do OmitType)
// }
