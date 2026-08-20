import { PostModelFromApi } from "@/models/post/post-model";
import { postRepository } from "@/repositories/post";
import { authenticatedApiRequest } from "@/utils/authenticated-api-request";
import { cache } from "react";

//procurar um post por id no banco de dados local (NestJS) usando o repositório
export const findPostByIdAdmin = cache( //uso o cache pra quando fazer a busca deixar dados salvos e não precisar ficar buscando novamente
  async (id: string) => { //passo um id  que é uma string como parametro
    return await postRepository.findById(id) //vou no repositório de posts e procuro um post pelo id usando o método findById
  }
)

//procurar um post por id na API do NestJS (requisição HTTP)
export const findPostByIdFromApiAdmin = cache(async (id: string) => { ///uso o cache pra quando fizer a busca deixar dados salvos e não precisar ficar buscando novamente
  const postsResponse = await authenticatedApiRequest<PostModelFromApi>( //faço uma requisição autenticada para a API, e o retorno será um único post do tipo PostModelFromApi
    `/post/me/${id}`, //passo o caminho da API com o id do post
    {
      headers: {  //defino os cabeçalhos da requisição
        'Content-Type': 'application/json', //informo que estou enviando e recebendo JSON
      },
      cache: 'no-store', ///aqui falo que não vou salvar dados no cache (sempre busca novo da API)
    },
  );

  return postsResponse; //retorno o post encontrado (ou erro se não existir)
});


//encontrar todos os posts no banco de dados local (NestJS) usando o repositório
export const findAllPostAdmin = cache( //uso o cache pra quando fazer a busca deixar dados salvos e não precisar ficar buscando novamente
  async () => {
    return postRepository.findAll() //la no repositorio de post vou trazer todos os posts
  }
)


//encontrar todos os posts na API do NestJS (requisição HTTP)
export const findAllPostFromApiAdmin = cache(async () => { //uso o cache pra quando fizer a busca deixar dados salvos e não precisar ficar buscando novamente
  const postsResponse = await authenticatedApiRequest<PostModelFromApi[]>(//faço uma requisição autenticada para a API, e o retorno será um array de posts do tipo PostModelFromApi
    `/post/me/`, //passo o caminho da API para buscar todos os posts
    {
      headers: { //defino os cabeçalhos da requisição
        'Content-Type': 'application/json', //informo que estou enviando e recebendo JSON
      },
      cache: 'no-store', //aqui falo que não vou salvar dados no cache (sempre busca novo da API)
    },
  );

  return postsResponse; //retorno todos os posts (ou erro)
});