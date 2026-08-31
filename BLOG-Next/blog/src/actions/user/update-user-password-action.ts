'use server';

import { deleteLoginSession } from '@/lib/login/manage-login';
import { getPublicUserFromApi } from '@/lib/user/api/get-user';
import { UpdatePasswordSchema } from '@/lib/user/schemas';
import { authenticatedApiRequest } from '@/utils/authenticated-api-request';
import { getZodErrorMessages } from '@/utils/get-zod-error-messages';
import { redirect } from 'next/navigation';

type UpdatePasswordActionState = { //criando type para padronizar e criar regras na estrutura do meu código
  errors: string[]; //array de errors
  success: boolean; // true ou false de success
};

export async function updatePasswordAction( //função para atualizar senha
  state: UpdatePasswordActionState, //pegando status atual
  formData: FormData, //pegando formulário que foi enviado
): Promise<UpdatePasswordActionState> { //prometo que os dados que vierem vão ser do schema UpdatePasswordActionState
  const user = await getPublicUserFromApi(); //pegando usuário autenticado

  if (!user) { //se o usuário não estiver autenticado
    await deleteLoginSession(); //deleto a sessão de login dele assim ele tem que fazer login novamente

    return { //retorno estado de erro
      errors: ['Você precisa fazer login novamente'], //coloco no array mostrando pra pessoa essa mensagem de erro
      success: false, //deixo o success como false já que operação falhou
    };
  }

  if (!(formData instanceof FormData)) { //se o formulário que foi enviado não for um formulário correto
    return { //retorno o estado de erro
      errors: ['Dados inválidos'], //lanço essa mensagem
      success: false, //coloco false já que operação falhou
    };
  }

  const formObj = Object.fromEntries(formData.entries()); //se o formulário está correto, ele vai vir uma lista, transformo essa lista em um objeto JavaScript
  const parsedFormData = UpdatePasswordSchema.safeParse(formObj); //valido o objeto com meu schema

  if (!parsedFormData.success) { //se a validação do objeto pelo schema não deu certo
    return { //retorno o estado de erro
      errors: getZodErrorMessages(parsedFormData.error.format()), //pego o erro do zod
      success: false, //deixo success como false já que a operação falhou
    };
  }

  const updatePasswordRes = await authenticatedApiRequest(  //se os dados enviados no formulário passou pelas validações faço uma requisição a API com esses dados autenticados
    `/user/me/password`, { //caminho da requisição
    method: 'PATCH', //o motodo HTTP que vou usar vai ser o de alteração parcial
    body: JSON.stringify(parsedFormData.data), //converto os dados JSON que foram enviados para STRING
    headers: { //configurações do cabeçalho
      'Content-Type': 'application/json', //coloco que os dados vão ser do tipo JSON
    },
  });

  if (!updatePasswordRes.success) { //se a requisição que eu tentei fazer deu erro
    return { //vou retornar esse estado de erro
      errors: updatePasswordRes.errors, //// os erros que vieram da API
      success: false, //deixo success como false já que a operação falhou
    };
  }

  await deleteLoginSession(); //se a requisição deu certo chamo meu metodo de exclusão de sesão assim a pessoa precisa fazer login novamente
  redirect('/login?userChanged=1'); //e redireciono ela para pagina de login
}