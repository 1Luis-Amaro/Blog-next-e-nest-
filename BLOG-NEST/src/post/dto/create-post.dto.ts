import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Length,
} from 'class-validator'; // Importa decoradores de validação do class-validator

export class CreatePostDto {
  @IsString({ message: 'Título precisa ser uma string' }) // Valida se o título é uma string
  @Length(10, 150, { message: 'Título precisa ter entre 10 e 150 caracteres' }) // Valida o tamanho mínimo e máximo do título
  title: string; // Título do post - obrigatório, string, entre 10 e 150 caracteres

  @IsString({ message: 'Excerto precisa ser uma string' }) // Valida se o excerto é uma string
  @Length(10, 200, { message: 'Excerto precisa ter entre 10 e 200 caracteres' }) // Valida o tamanho mínimo e máximo do excerto
  excerpt: string; // Excerto/resumo do post - obrigatório, string, entre 10 e 200 caracteres

  @IsString({ message: 'Conteúdo precisa ser uma string' }) // Valida se o conteúdo é uma string
  @IsNotEmpty({ message: 'Conteúdo não pode ficar vazio' }) // Valida se o conteúdo não está vazio
  content: string; // Conteúdo principal do post - obrigatório, string, não pode ser vazio

  @IsOptional() // Vai ser requerido no Next.js // Torna o campo opcional (pode ser undefined ou null)
  @IsUrl(
    { require_tld: false },
    { message: 'URL da imagem precisa ser uma URL válida' },
  ) // Top level domain proíbe localhost e IP // Valida se é uma URL válida, permitindo localhost e IPs
  coverImageUrl?: string; // URL da imagem de capa - opcional, deve ser uma URL válida se fornecida
}
