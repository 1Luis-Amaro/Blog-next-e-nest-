'use server'

import { getLoginSessionForApi } from "@/lib/login/manage-login";
import { CreatePostForApiSchema, PublicPostForApiDto, PublicPostForApiSchema } from "@/lib/post/schemas";
import { PostModel } from "@/models/post/post-model";
import { postRepository } from "@/repositories/post";
import { authenticatedApiRequest } from "@/utils/authenticated-api-request";
import { getZodErrorMessages } from "@/utils/get-zod-error-messages";
import { makeSlugFromText } from "@/utils/make-slug-from-text";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { v4 as uuidV4 } from 'uuid'

type CreatePostActionState = {   // crio um tipo para definir a estrutura do estado da ação
  formState: PublicPostForApiDto; // o estado do formulário deve estar no formato PublicPostForApiDto (dados públicos do post)
  errors: string[]; //os errors um array de strig
  success?: string;  // verificação de sucesso (opcional, pode ser string)


}

export async function createPostAction( // action que cria um novo post
  prevState: CreatePostActionState,  // recebe o estado anterior da ação (vem do useActionState)
  formData: FormData, // recebe os dados do formulário (obrigatoriamente do tipo FormData)
):
  Promise<CreatePostActionState> { // prometo que a função vai retornar algo do tipo CreatePostActionState (mesmo que demore)
  const isAuthenticated = await getLoginSessionForApi() // pego o token JWT da sessão para verificar se o usuário está autenticado

  if (!(formData instanceof FormData)) { // verifico se o formData enviado é realmente um FormData (válido)
    return { // se não for, retorno o estado de erro
      formState: /// os campos do formulário
        prevState.formState,   // mantenho os dados que estavam no estado anterior
      errors: ['Dados inválidos'] // e mostrar um erro para o usuário de dados invalidos

    }
  }

  const formDataToObj = Object.fromEntries(formData.entries()) // converto o formulário que veio para objeto javascrpit
  const zodParsedObj = CreatePostForApiSchema.safeParse(formDataToObj) // o objeto que transformei vou validar com o schema de criação de post (sem author e published)



  if (!isAuthenticated) { // se a pessoa não estiver autenticada (token inválido ou expirado)
     return { // retorno o estado de erro
      formState: PublicPostForApiSchema.parse(formDataToObj), // converto os dados para o schema público (para reexibir o que o usuário digitou)
       errors: ['Faça login em outra aba antes de salvar'] // e peço para ele se autenticar
      }
    }

  if(!zodParsedObj.success) {// se a validação do Zod falhou (dados inválidos)
    const errors = getZodErrorMessages(zodParsedObj.error.format());  // extraio todas as mensagens de erro do Zod
    return {  // retorno o estado de erro
      errors, //// os erros extraídos
      formState: PublicPostForApiSchema.parse(formDataToObj) // os dados enviados (para reexibir no formulário)
    }
  }

const newPost = zodParsedObj.data //se passou por todas as validações, pego os dados validados

const createPostResponse = await authenticatedApiRequest<PublicPostForApiDto>( // chamo a função de requisição autenticada que vai retornar um post do tipo PublicPostForApiDto
  `/post/me`, // caminho da API (vai criar um post do usuário autenticado)
  {
    method: 'POST', // método HTTP POST (criar um novo recurso)
    headers: {
      'Content-Type': 'application/json' // informo que estou enviando JSON
    },
    body: JSON.stringify(newPost) // converto os dados validados para string JSON e envio no corpo da requisição
  }
)

 if (!createPostResponse.success) { // se a criação do post na API NÃO foi bem-sucedida
    return { //retorno o estado de erro
      formState: PublicPostForApiSchema.parse(formDataToObj),// reexibo os dados que o usuário digitou
      errors: createPostResponse.errors, // e mostro os erros que vieram da API
    };
  }

const createdPost = createPostResponse.data // se deu tudo certo, pego os dados do post criado

revalidateTag('posts') // revalido o cache do Next.js para atualizar a lista de posts
redirect(`/admin/post/${createdPost.id}?created=1`) // redireciono o usuário para a página de edição do post criado com parâmetro de sucesso


}