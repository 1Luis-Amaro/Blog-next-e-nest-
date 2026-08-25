import { PostModelFromApi } from "@/models/post/post-model"
import { postRepository } from "@/repositories/post"
import { apiRequest } from "@/utils/api-request"
import { unstable_cache } from "next/cache"
import { notFound } from "next/navigation"
import { cache } from "react"

export const findAllPublicPostsCached = cache( // Segunda camada de cache: guarda na memória durante a requisição
  unstable_cache(  // Primeira camada de cache: guarda no cache global do Next.js
    (async () => { // Função que será executada e terá o resultado guardado
      return await postRepository.findAllPublic() // Busca todos os posts publicados no banco de dados
    }), ['posts'], /// Chave única para identificar este cache (usado internamente)
    {// Configurações do cache
      tags: ['posts'] // Tags para revalidar o cache (quando chamar revalidateTag('posts'))
    }
  )
)
export const findAllPublicPostsFromApiCached = cache( // Segunda camada de cache: guarda na memória durante a requisição (cache em memória)
  async () => { // Função que será executada e terá o resultado guardado
  const postsResponse = await apiRequest<PostModelFromApi[]>(// Faço uma requisição HTTP para a API (NestJS) que vai me retornar um array do tipo PostModelFromApi
    `/post`, {  // Caminho da API que retorna todos os posts públicos
    next: { // Configurações de cache do Next.js para esta requisição
      tags: ['posts'], // Tag para revalidar o cache (quando chamar revalidateTag('posts'))
      revalidate: 86400, // Tempo de revalidação: 86400 segundos = 24 horas (1 dia)
    },
  });

  return postsResponse; // Retorna a resposta da API (array de posts públicos)
});

// Função para encontrar um post público pelo slug (identificador amigável na URL)
export const findPublicPostBySlugCached = cache( /// Segunda camada de cache: guarda na memória durante a requisição (cache em memória)
  (slug: string) => { // Recebe o slug como parâmetro (ex: 'meu-primeiro-post')
  return unstable_cache(//primeira camada cache global do next
    async (slug: string) => { // Função que será executada e terá o resultado guardado, recebe o slug como parâmetro
    const post = await postRepository  //vou no meu repositorio no banco de dados onde está os posts
      .findBySlugPublic(slug) //utilizo o metodo de procurar pela slug e coloco nesse metodo o parametro passado inicial que vai ser a slug que o usuário informou
      .catch(() => undefined) // Se der erro (ex: post não encontrado), captura e retorna undefined em vez de lançar exceção

    if (!post) notFound()  // Se o post não for encontrado (undefined), exibe a página 404

    return post //se encontrar retorno o post
  }, [`post-${slug}`], // Chave única do cache para este post específico (ex: 'post-meu-primeiro-post')
    { tags: [`post-${slug}`] }, // Tag única para revalidar o cache deste post específico (ex: 'post-meu-primeiro-post')
  )(slug) // Executa a função imediatamente passando o slug

})

//função para buscar post publicos publicados da API
export const findPublicPostBySlugFromApiCached = cache( /// Segunda camada de cache: guarda na memória durante a requisição (cache em memória)
  async (slug: string) => { // Função que será executada e terá o resultado guardado, recebe o slug como parâmetro
  const postsResponse = await apiRequest<PostModelFromApi>( // Faço uma requisição HTTP para a API (NestJS) que vai me retornar dados do tipo PostModelFromApi
    `/post/${slug}`, { //caminho que vou fazer essa requisição que vou buscar esses posts
    next: { // Configurações de cache do Next.js para esta requisição
      tags: [`post-${slug}`], // Tag para revalidar o cache (quando chamar revalidateTag('posts'))
      revalidate: 86400, // Tempo de revalidação: 86400 segundos = 24 horas (1 dia)
    },
  });

  return postsResponse; //retorno os posts publicos da API

});