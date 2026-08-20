import { PostModel } from "@/models/post/post-model";
import { PostRepository } from "./post-repository"; // Importa a interface PostRepository do arquivo local
import { drizzleDb } from "@/db/drizzle";
import { asyncDelay } from "@/utils/async-delay";
import { postsTable } from "@/db/drizzle/schemas";
import { eq } from "drizzle-orm";

const simulateWaitMs = Number(process.env.SIMULATE_WAIT_IN_MS) || 0 // Pega o tempo de simulação do .env ou usa 0 se não existir

export class DrizzlePostRepository implements PostRepository {// Classe que implementa a interface PostRepository usando Drizzle ORM

  async findAllPublic(): Promise<PostModel[]> { // Busca todos os posts publicados (published = true)
    await asyncDelay(simulateWaitMs, true)  // Simula demora (se configurado)

    const posts = await drizzleDb.query.posts.findMany({ // Faz uma query SQL: SELECT * FROM posts
      orderBy: (posts, { desc }) => desc(posts.createdAt), // Ordena por data de criação (mais recente primeiro)
      where: (posts, { eq }) => eq(posts.published, true), // Filtra apenas os que têm published = true
    });

    return posts;
  } //acha todos que estão com published como true

  async findBySlugPublic(slug: string): Promise<PostModel> {  // Busca um post pelo slug (identificador amigável) e publicado

    await asyncDelay(simulateWaitMs, true)  // Simula demora (se configurado
    const post = await drizzleDb.query.posts.findFirst({ // Faz uma query SQL: SELECT * FROM posts WHERE ...
      where: (posts, { eq, and }) => // Define as condições da query
        and(eq(posts.published, true), eq(posts.slug, slug))  // published = true E slug = slug
    });


    if (!post) throw new Error('Post não encontrado para Slug'); // Se não encontrar, lança um erro

    return post; // Retorna o post encontrado

  }

  // Busca TODOS os posts (incluindo rascunhos)
  async findAll(): Promise<PostModel[]> {
    await asyncDelay(simulateWaitMs, true)// Simula demora (se configurado)
    const posts = await drizzleDb.query.posts.findMany({ // Faz uma query SQL: SELECT * FROM posts
      orderBy: (posts, { desc }) => desc(posts.createdAt) // Ordena por data de criação (mais recente primeiro)
    });
    return posts
  } // acha todos incluindo os que não são publicos


  async findById(id: string): Promise<PostModel> { // Busca um post pelo ID
    await asyncDelay(simulateWaitMs, true)  // Simula demora (se configurado)

    const post = await drizzleDb.query.posts.findFirst({ // Faz uma query SQL: SELECT * FROM posts WHERE id = ...
      where: (posts, { eq }) => eq(posts.id, id) // Filtra pelo ID
    })

    if (!post) throw new Error('Post não encontrado para ID'); // Se não encontrar, lança um erro

    return post // Retorna o post encontrado

  }
  async create(post: PostModel): Promise<PostModel> {  // Cria um novo post no banco
    const postExists = await drizzleDb.query.posts.findFirst({ // Verifica se já existe um post com o mesmo ID ou Slug
      where:(posts, {or, eq}) => /// Define as condições: ID ou Slug
        or(eq(posts.id, post.id), eq(posts.slug, post.slug)), //// ID = id OU Slug = slug
      columns: {id: true}  // Só precisa do ID para verificar
    })
    if(!!postExists){ // Se já existir (!! converte para boolean)
      throw new Error('Post com ID ou Slug já existe na base de dados')  // Lança erro
    }

    await drizzleDb.insert(postsTable).values(post) //se não existir vou inserir os valores desse post na tabela
    return post //Retorna o post criado
}

async delete(id: string ): Promise<PostModel>{ // Deleta um post pelo ID
  const post = await drizzleDb.query.posts.findFirst({ // Busca o post pelo ID
    where: (posts, {eq}) => eq(posts.id, id), // Filtra pelo ID
  })

  if(!post) { // Se não encontrar
    throw new Error('Post não existe') // Lança erro
  }

  await drizzleDb.delete(postsTable).where(eq(postsTable.id, id)) // Deleta o post: DELETE FROM posts WHERE id = ...

  return post // Retorna o post deletado
}

async update( // Atualiza um post existente
    id: string, // ID do post a ser atualizado
    newPostData: Omit<PostModel, 'id' | 'slug' | 'createdAt' | 'updatedAt'>,  // Dados novos (sem id, slug, createdAt, updatedAt)
  ): Promise<PostModel> { // Retorna o post atualizado
    const oldPost = await drizzleDb.query.posts.findFirst({ // Busca o post atual pelo ID
      where: (posts, { eq }) => eq(posts.id, id), // Filtra pelo ID
    });

    if (!oldPost) { // Se não encontrar
      throw new Error('Post não existe'); // Lança erro
    }

    const updatedAt = new Date().toISOString(); // Cria a data de atualização
    const postData = { // Cria o objeto com os dados para atualizar
      author: newPostData.author, // Autor
      content: newPostData.content, // Conteúdo
      coverImageUrl: newPostData.coverImageUrl, // URL da imagem de capa
      excerpt: newPostData.excerpt, // Excerto
      published: newPostData.published, // Publicado ou não
      title: newPostData.title, // Título
      updatedAt, // Data de atualização
    };
    await drizzleDb  // Faz a query SQL: UPDATE posts SET ... WHERE id = ...
      .update(postsTable) // Tabela a ser atualizada
      .set(postData) // Dados a serem atualizados
      .where(eq(postsTable.id, id)); // Condição: id = id

    return { // Retorna o post atualizado (combinando dados antigos e novos)
      ...oldPost, // Dados antigos
      ...postData, // Dados novos (sobrescrevem os antigos)
    };
  }

}
