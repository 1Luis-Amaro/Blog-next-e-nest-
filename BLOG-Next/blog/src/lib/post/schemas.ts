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

export const CreatePostForApiSchema = PostBaseSchema.omit({ //pego toda base que fiz e tiro dela o author e o publicado,
  author: true, //true pra confirmar que estou tirando o author
  published: true, //true pra confirmar que estou tirando o published
}).extend({});

export const UpdatePostForApiSchema = PostBaseSchema.omit({   //pego toda base que fiz novamente
  author: true,   // tiro o author ja que se for atualizar um post não quero atualizar o criador dele, somente os dados do post
}).extend({});

export const PublicPostForApiSchema = PostBaseSchema.extend({ //aqui pego da base padrao de post e extendo somente algns campos deixando eles como padrão
  id: z.string().default(''),
  slug: z.string().default(''),
  title: z.string().default(''),
  excerpt: z.string().default(''),
  author: PublicUserSchema.optional().default({
    id: '',
    email: '',
    name: '',
  }),
  content: z.string().default(''),
  coverImageUrl: z.string().default(''),
  createdAt: z.string().default(''),
});

export type CreatePostForApiDto = z.infer<typeof CreatePostForApiSchema>; //criando o tipo pra poder usar em outros lugares que vai obrigar usar as regras que coloquei dentro
export type UpdatePostForApiDto = z.infer<typeof UpdatePostForApiSchema>;  //criando o tipo pra poder usar em outros lugares que vai obrigar usar as regras que coloquei dentro
export type PublicPostForApiDto = z.infer<typeof PublicPostForApiSchema>;  //criando o tipo pra poder usar em outros lugares que vai obrigar usar as regras que coloquei dentro