import { isUrlOrRelativePath } from '@/utils/is-url-relative-path';
import sanitizeHtml from 'sanitize-html';
import { z } from 'zod';
import { PublicUserSchema } from '../user/schemas';

//criando a base do meu schema de base, defino que são string tiro espaço coloco o minimo de caracter aceito e o maximo
const PostBaseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Título deve ter, no mínimo, 3 caracteres')
    .max(120, 'Título deve ter um máximo de 120 caracteres'),
  content: z
    .string()
    .trim()
    .min(3, 'Conteúdo é obrigatório')
    .transform(val => sanitizeHtml(val)),
  author: z
    .string()
    .trim()
    .min(4, 'Autor precisa de um mínimo de 4 caracteres')
    .max(100, 'Nome do autor não deve ter mais que 100 caracteres'),
  excerpt: z
    .string()
    .trim()
    .min(3, 'Excerto precisa de um mínimo de 3 caracteres')
    .max(200, 'Excerto não deve ter mais que 200 caracteres'),
  coverImageUrl: z.string().trim().refine(isUrlOrRelativePath, {
    message: 'URL da capa deve ser uma URL ou caminho para imagem',
  }),
  published: z
    .union([
      z.literal('on'),
      z.literal('true'),
      z.literal('false'),
      z.literal(true),
      z.literal(false),
      z.literal(null),
      z.literal(undefined),
    ])
    .default(false)
    .transform(val => val === 'on' || val === 'true' || val === true),
});

// PostCreateSchema: igual ao base por enquanto
export const PostCreateSchema = PostBaseSchema;

// PostUpdateSchema: pode incluir campos extras no futuro (ex: id)
export const PostUpdateSchema = PostBaseSchema.extend({
  // id: z.string().uuid('ID inválido'),
});

// CreatePostForApiSchema: schema que valida os dados que o cliente ENVIA pra API ao CRIAR um post
export const CreatePostForApiSchema = PostBaseSchema.omit({ //pego toda base que fiz e tiro dela o author e o publicado,
  author: true, //true pra confirmar que estou tirando o author, pois a API quem define quem é o autor pelo usuário logado
  published: true, //true pra confirmar que estou tirando o published, pois começa como false por padrão no backend
}).extend({});

export const UpdatePostForApiSchema = PostBaseSchema.omit({   //pego toda base que fiz novamente
  author: true,   // //tiro o author porque não quero que o cliente possa alterar o criador do post, só o backend define isso
}).extend({});//published fica pq o cliente pode querer publicar ou despublicar o post via API

export const PublicPostForApiSchema = PostBaseSchema.extend({//aqui pego da base padrao de post e adiciono campos que o backend gera e envia
  id: z.string().default(''), //id gerado pelo banco de dados
  slug: z.string().default(''), //slug gerado pelo backend baseado no título
  title: z.string().default(''),
  excerpt: z.string().default(''),
  author: PublicUserSchema.optional().default({  //author vira um objeto completo do usuário, não só string
    id: '',
    email: '',
    name: '',
  }),
  content: z.string().default(''),
  coverImageUrl: z.string().default(''),
  createdAt: z.string().default(''), //data de criação gerada pelo backend
});

export type CreatePostForApiDto = z.infer<typeof CreatePostForApiSchema>; //criando o tipo pra validar dados que o cliente ENVIA pra CRIAR um post
export type UpdatePostForApiDto = z.infer<typeof UpdatePostForApiSchema>; //criando o tipo pra validar dados que o cliente ENVIA pra ATUALIZAR um post
export type PublicPostForApiDto = z.infer<typeof PublicPostForApiSchema>; //criando o tipo pra validar dados que a API RETORNA pro cliente