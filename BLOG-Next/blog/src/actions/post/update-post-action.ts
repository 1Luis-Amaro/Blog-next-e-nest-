'use server'

import { getLoginSessionForApi } from "@/lib/login/manage-login";
import { PostUpdateSchema, PublicPostForApiDto, PublicPostForApiSchema, UpdatePostForApiSchema } from "@/lib/post/schemas";
import { authenticatedApiRequest } from "@/utils/authenticated-api-request";
import { makeRandomString } from "@/utils/make-random-string";
import { revalidateTag } from "next/cache";


type UpdatePostActionState = { // crio um tipo para definir a estrutura do estado da ação
  formState: PublicPostForApiDto;// o estado do formulário deve estar no formato PublicPostForApiDto (dados públicos do post)
  errors: string[]; // os erros são um array de strings
  success?: string;  // verificação de sucesso (opcional, pode ser string)

}

export async function updatePostAction( //função de atualizar um post existente
  prevState: UpdatePostActionState, // recebo o estado anterior da ação (vem do useActionState
  formData: FormData, //passo o tipo de formulário para minha const
):
  Promise<UpdatePostActionState> { // prometo que essa função vai retornar dados que são do tipo UpdatePostActionState mesmo que demore
  const isAuthenticated = await getLoginSessionForApi() //pego o token JWT autenticado do usuário pra verificar se ele está logado mesmo


  if (!(formData instanceof FormData)) { //verifico se o formulário enviado realmente é um formulário
    return { //retorno o estado de erro
      formState: // pego os campos do formulário
        prevState.formState, // mantenho os dados que estavam no estado anterior
      errors: ['Dados inválidos'] //e mostro um erro para o usuário de Dados invalidos

    }
  }

  const id = formData.get('id')?.toString() || ''  //agora se passar dessa validação, tento pegar id do que veio do formulário e converto para string, se não veio nada deixo o campo em branco

  if (!id || typeof id !== 'string') { //agora se não tiver o id e se o id não for string
    return { //retorno o estado de erro
      formState: // pego o campo do formulário
        prevState.formState, // mantenho os dados enviados
      errors: ['ID inválido'] //e retorno uma mensagem para usuário informando que o id dele está invalido

    }
  }

  const formDataToObj = Object.fromEntries(formData.entries())// converto os dados do FormData para um objeto JavaScript normal
  const zodParsedObj = UpdatePostForApiSchema.safeParse(formDataToObj) //valido os dados com o schema de atualização de post (sem author)


  if (!isAuthenticated) { //se o usuário não estiver autenticado, o token é invalido ou expirou
    return { //vou retornar o estado de erro
      formState: PublicPostForApiSchema.parse(formDataToObj),  // converto os dados para o schema público (para reexibir o que o usuário digitou)
      errors: ['Faça login em outra aba antes de salvar'] //// e peço para ele se autenticar
    }
  }

  if (!zodParsedObj.success) { // agora se os dados que transformei para objeto não tiver success quer dizer que a validação falhou

    const errors = zodParsedObj.error.issues.map(issue => issue.message); return { //vou passar por cada erro e extrair cada mensagem
      errors, //pego todas essas mensagens de erro
      formState: PublicPostForApiSchema.parse(formDataToObj), // reexibo os dados que o usuário digitou

    }
  }

  const newPost = zodParsedObj.data; //se passar por todas essas validações pego os dados do validados

  const updatePostResponse = await authenticatedApiRequest<PublicPostForApiDto>( // chamo a função de requisição autenticada que vai retornar um post do tipo PublicPostForApiDto
    `/post/me/${id}`, // caminho da API com o id do post a ser atualizado
    {
      method: 'PATCH', //coloco o Método HTTP que vai ser de atualização parcial
      body: JSON.stringify(newPost), //os dados JSON que vieram converto para string
      headers: { // defino os cabeçalhos da requisição
        'Content-Type': 'application/json', // informo que estou enviando JSO
      },
    },
  );

  if (!updatePostResponse.success) { //se a atualização não foi um sucesso, teve algum erro
    return { //vou retornar o estado de erro
      formState: PublicPostForApiSchema.parse(formDataToObj), // reexibo os dados que o usuário digitou
      errors: updatePostResponse.errors, // e mostro os erros que vieram da API
    }
  }

  const post = updatePostResponse.data; /// se deu tudo certo, pego os dados do post atualizado

  revalidateTag('posts'); // revalido o cache do Next.js para atualizar a lista de posts
  revalidateTag(`post-${post.slug}`); // revalido o cache do Next.js para atualizar o post específico pelo slug

  return { //e retorno o estado de sucesso agora
    formState: PublicPostForApiSchema.parse(post), // converto os dados do post atualizado para o schema público
    errors: [], //deixo o array de erro vazio
    success: makeRandomString(), // gero uma string aleatória para forçar a atualização do estado (evitar cache do formulário)
  };
}