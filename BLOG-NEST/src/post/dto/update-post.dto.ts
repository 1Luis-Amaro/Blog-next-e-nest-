import { PartialType, PickType } from '@nestjs/mapped-types'; // Importa utilitários para criar DTOs parciais e selecionar campos
import { CreatePostDto } from './create-post.dto'; // Importa o DTO base de criação de posts
import { IsBoolean, IsOptional } from 'class-validator'; // Importa decoradores de validação do class-validator

export class UpdatePostDto extends PartialType(
  // Cria um DTO com todos os campos opcionais (PartialType)
  PickType(CreatePostDto, ['title', 'coverImageUrl', 'excerpt', 'content']), // Seleciona apenas os campos especificados do CreatePostDto
) {
  @IsOptional() // Vai depender da lógica que criarmos no service ou no Next.js // Torna o campo opcional (pode ser undefined ou null)
  @IsBoolean({ message: 'Campo de publicar post precisa ser boolean' }) // Valida se o valor é booleano (true ou false)
  published?: boolean; // Status de publicação do post - opcional, deve ser booleano se fornecido
}
