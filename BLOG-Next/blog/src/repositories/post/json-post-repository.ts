import { PostRepository } from './post-repository';
import { resolve } from 'path';
import { readFile, writeFile } from 'fs/promises';
import { PostModel } from '@/models/post/post-model';

const simulateWaitMs = Number(process.env.SIMULATE_WAIT_IN_MS) || 0; // Pega o tempo de simulação do .env ou usa 0 se não existir

const ROOT_DIR = process.cwd(); // Pega o diretório raiz do projeto (onde o código está rodando)
const JSON_POSTS_FILE_PATH = resolve( // Cria o caminho absoluto para o arquivo JSON
  ROOT_DIR, // Diretório raiz
  'src', // Pasta src
  'db', // Pasta db
  'seed', // Pasta seed
  'posts.json', // Nome do arquivo
);

export class JsonPostRepository implements PostRepository { // Classe que implementa a interface PostRepository usando arquivo JSON
  private async simulateWait() {// Método privado para simular demora (útil para testes de loading)
    if (simulateWaitMs <= 0) return; // Se o tempo for menor ou igual a zero, não espera

    await new Promise(resolve => setTimeout(resolve, simulateWaitMs)); // Cria uma Promise que resolve depois do tempo definido
  }

  private async readFromDisk(): Promise<PostModel[]> {  // Método privado para ler os posts do arquivo JSON
    const jsonContent = await readFile(JSON_POSTS_FILE_PATH, 'utf-8');  // Lê o arquivo JSON como string
    const parsedJson = JSON.parse(jsonContent); // Converte a string JSON para objeto JavaScript
    const { posts } = parsedJson; // Extrai o array de posts do objeto
    return posts; // Retorna o array de posts
  }

  private async writeToDisk(posts: PostModel[]): Promise<void> { // Método privado para escrever os posts no arquivo JSON
    const jsonToString = JSON.stringify({ posts }, null, 2); // Converte o array de posts para string JSON formatada
    await writeFile(JSON_POSTS_FILE_PATH, jsonToString, 'utf-8'); // Escreve a string JSON no arquivo
  }

  async findAllPublic(): Promise<PostModel[]> { // Busca todos os posts que estão publicados
    await this.simulateWait(); // Simula demora (se configurado)

    const posts = await this.readFromDisk(); // Lê todos os posts do arquivo
    return posts.filter(post => post.published); // Filtra e retorna apenas os que têm published = true
  }

  async findAll(): Promise<PostModel[]> { // Busca TODOS os posts (incluindo rascunhos)
    await this.simulateWait(); // Simula demora (se configurado)

    const posts = await this.readFromDisk(); // Lê todos os posts do arquivo
    return posts; // Retorna todos os posts (sem filtrar)
  }

  async findById(id: string): Promise<PostModel> {// Busca um post pelo ID
    const posts = await this.findAllPublic(); // Busca apenas os posts publicados
    const post = posts.find(post => post.id === id); // Procura o post com o ID correspondente

    if (!post) throw new Error('Post não encontrado para ID');  // Se não encontrar, lança erro

    return post;  // Retorna o post encontrado
  }

  async findBySlugPublic(slug: string): Promise<PostModel> { // Busca um post pelo slug (identificador amigável)
    const posts = await this.findAllPublic(); // Busca apenas os posts publicados
    const post = posts.find(post => post.slug === slug); // Procura o post com o slug correspondente

    if (!post) throw new Error('Post não encontrado para slug'); // Se não encontrar, lança erro

    return post; // Retorna o post encontrado
  }

  async create(post: PostModel): Promise<PostModel> { // Cria um novo post
    const posts = await this.findAll(); // Busca TODOS os posts (para verificar duplicidade)

    if (!post.id || !post.slug) { // Verifica se o post tem ID e Slug
      throw new Error('Post sem ID ou Slug'); // Se não tiver, lança erro
    }

    const idOrSlugExist = posts.find( // Verifica se já existe um post com o mesmo ID ou Slug
      savedPost => savedPost.id === post.id || savedPost.slug === post.slug,
    );

    if (idOrSlugExist) { // Se já existir
      throw new Error('ID ou Slug devem ser únicos'); // Lança erro
    }

    posts.push(post); // Adiciona o novo post ao array
    await this.writeToDisk(posts); // Salva o array atualizado no arquivo

    return post; // Retorna o post criado
  }

  async delete(id: string): Promise<PostModel> { // Deleta um post pelo ID
    const posts = await this.findAll(); // Busca TODOS os posts
    const postIndex = posts.findIndex(p => p.id === id); // Encontra o índice do post

    if (postIndex < 0) { // Se não encontrar
      throw new Error('Post não existe'); // Lança erro
    }

    const post = posts[postIndex]; // Guarda o post que vai ser deletado
    posts.splice(postIndex, 1); // Remove o post do array
    await this.writeToDisk(posts); // Salva o array atualizado no arquivo

    return post; // Retorna o post deletado
  }

  async update( // Atualiza um post existente
    id: string, // ID do post a ser atualizado
    newPostData: Omit<PostModel, 'id' | 'slug' | 'createdAt' | 'updatedAt'>, // Dados novos (sem id, slug, createdAt, updatedAt)
  ): Promise<PostModel> { // Retorna o post atualizado
    const posts = await this.findAll(); // Busca TODOS os posts
    const postIndex = posts.findIndex(p => p.id === id); // Encontra o índice do post
    const savedPost = posts[postIndex]; // Guarda o post atual

    if (postIndex < 0) { // Se não encontrar
      throw new Error('Post não existe'); // Lança erro
    }

    const newPost = { // Cria o novo post com os dados atualizados
      ...savedPost, // Mantém os dados antigos
      ...newPostData, // Sobrescreve com os novos dados
      updatedAt: new Date().toISOString(), // Atualiza a data de modificação
    };
    posts[postIndex] = newPost; // Substitui o post antigo pelo novo
    await this.writeToDisk(posts); // Salva o array atualizado no arquivo
    return newPost; // Retorna o post atualizado
  }
}