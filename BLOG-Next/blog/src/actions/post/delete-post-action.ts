'use server';

import { getLoginSessionForApi } from '@/lib/login/manage-login';
import { PublicPostForApiDto } from '@/lib/post/schemas';
import { authenticatedApiRequest } from '@/utils/authenticated-api-request';
import { revalidateTag } from 'next/cache';

export async function deletePostAction(id: string) { //função de deletar post
  const isAuthenticated = await getLoginSessionForApi(); // pego token JWT do usuário

  if (!isAuthenticated) { //se ele não estiver autenticado
    return { //retorno estado de erro
      error: 'Faça login novamente em outra aba', //lanço uma mensagem para ele fazer  login novamente
    };
  }

  if (!id || typeof id !== 'string') { // se o id não vier na requisição ou o id não for uma string
    return { //retorno o estado de erro
      error: 'Dados inválidos', //lanço a mensagem para o usuário de dados invalidos
    };
  }

  const postResponse = await authenticatedApiRequest<PublicPostForApiDto>( // chamo a função de requisição autenticada que vai retornar um post do tipo PublicPostForApiDto
    `/post/me/${id}`, //passo o caminho que vou pegar os posts
    {
      headers: { //o cabeçalho falo que os dados são do tipo JSON
        'Content-Type': 'application/json',
      },
    },
  );

  if (!postResponse.success) {  //se a requisição não trazer o post
    return { //retorno o estado de erro
      error: 'Erro ao encontrar post', //lanço a mensagem de erro ao encontrar o post
    };
  }

  const deletePostResponse = await authenticatedApiRequest<PublicPostForApiDto>( // chamo a função de requisição autenticada que vai retornar um post do tipo PublicPostForApiDto
    `/post/me/${id}`,  //passo o caminho que vou pegar os posts
    {
      method: 'DELETE', // passo o metado HTTP que vai ser o de exclusão
      headers: { //o tipo de dados vai ser JSON
        'Content-Type': 'application/json',
      },
    },
  );

  if (!deletePostResponse.success) { //se não tiver success na deleção de post que dizer que de erro
    return { //vou retornar o estado de erro
      error: 'Erro ao apagar post', // e lanço a mensagem pro usuário informando que deu erro apagar o post
    };
  }

  revalidateTag('posts'); // revalido o cache do Next.js para atualizar a lista de posts
  revalidateTag(`post-${postResponse.data.slug}`); // revalido o cache do Next.js para atualizar o post específico pelo slug

  return {
    error: '', //retorno o erro vazio
  };
}