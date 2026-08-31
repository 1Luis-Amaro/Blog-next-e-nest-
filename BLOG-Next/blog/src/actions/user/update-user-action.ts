'use server'; // Avisa ao Next.js que esta função só roda no servidor

import { deleteLoginSession } from '@/lib/login/manage-login'; // Importa a função que deleta a sessão de login (logout)
import { getPublicUserFromApi } from '@/lib/user/api/get-user'; // Importa a função que busca os dados do usuário autenticado na API
import {
  PublicUserDto,
  PublicUserSchema,
  UpdateUserSchema,
} from '@/lib/user/schemas'; // Importa os schemas de validação e os tipos de usuário
import { authenticatedApiRequest } from '@/utils/authenticated-api-request'; // Importa a função que faz requisições autenticadas para a API
import { getZodErrorMessages } from '@/utils/get-zod-error-messages'; // Importa a função que extrai mensagens de erro do Zod
import { redirect } from 'next/navigation'; // Importa a função que redireciona o usuário para outra página

type UpdateUserActionState = { //tipo que eu crio para manter um padrão e criar regras no meu codigo
  user: PublicUserDto; //dados que são transferidos e que não possuem nenhuma informação confidencial
  errors: string[]; //array de errors
  success: boolean; // Indica se a operação foi bem-sucedida (true) ou não (false)
};

export async function updateUserAction( //action de atualização de usuário
  state: UpdateUserActionState, // Estado atual da ação (vem do useActionState)
  formData: FormData, // Dados do formulário enviado pelo usuário
): Promise<UpdateUserActionState> { // Prometo que os dados vão retornar do tipo que criei (UpdateUserActionState)
  const user = await getPublicUserFromApi(); // Busco os dados atuais do usuário autenticado na API

  if (!user) { // Se NÃO conseguir pegar o usuário (token inválido ou expirado)
    await deleteLoginSession(); //vou deletar a sessão dele dessa forma faço ele a fazer login novamente

    return {  // Retorno o estado de erro
      user: state.user, // Mantenho o usuário que estava no estado
      errors: ['Você precisa fazer login novamente'], // Mensagem pedindo para fazer login novamente
      success: false, // Indico que a operação falhou
    };
  }

  if (!(formData instanceof FormData)) { //verifico o formulário é valido, se não for
    return { //vou ternar o seguinte
      user: state.user, // Mantenho o usuário que estava no estado
      errors: ['Dados inválidos'], // Mensagem de dados inválidos
      success: false,  // Indico que a operação falhou
    };
  }

  const formObj = Object.fromEntries(formData.entries()); //se o formulário for valido ele vem como uma lista, transforma a lista para um objeto javaScript
  const parsedFormData = UpdateUserSchema.safeParse(formObj); // Valido os dados do formulário com o schema de atualização de usuário (sem senha)

  if (!parsedFormData.success) { // Se a validação do Zod falhou (dados inválidos)
    return { // Retorno o estado de erro
      user: PublicUserSchema.parse(formObj), // Converto os dados para o schema público (para reexibir o que o usuário digitou)
      errors: getZodErrorMessages(parsedFormData.error.format()), // Extraio as mensagens de erro do Zod
      success: false, // Indico que a operação falhou
    };
  }

  const updateResponse = await authenticatedApiRequest<PublicUserDto>(  // Faço uma requisição autenticada para a API para atualizar o usuário
    `/user/me`,  // Caminho da API para atualizar o usuário autenticado
    {
      method: 'PATCH',// Método HTTP PATCH (atualização parcial)
      body: JSON.stringify(parsedFormData.data), // Converto os dados validados para string JSON e envio no corpo
      headers: { // Defino os cabeçalhos da requisição
        'Content-Type': 'application/json', // Informo que estou enviando JSON
      },
    },
  );

  if (!updateResponse.success) {// Se a atualização na API NÃO foi bem-sucedida
    return { /// Retorno o estado de erro
      user: PublicUserSchema.parse(formObj),  //Converto os dados para o schema público (para reexibir o que o usuário digitou)
      errors: updateResponse.errors,// Erros que vieram da API
      success: false, //e deixo como operação não sucedida
    };
  }

  if (user.email !== updateResponse.data.email) {  // Se o e-mail atual do usuário for diferente do e-mail que foi atualizado (foi alterado)
    await deleteLoginSession(); //deleto a sessão de login já que isso quer dizer que o e-mail mudou
    redirect('/login?userChanged=1'); // e redirecionar para a página de login com parâmetro indicando que o usuário foi modificado
  }

  // Isso aqui é a lista de posts
  // Não vai atualizar o single post
  // O nome de usuário (caso atualizado) só vai mudar
  // após o revalidate por conta do cache
  // revalidateTag('posts');

  return { // Se tudo deu certo, retorno o estado de sucesso
    user: PublicUserSchema.parse(updateResponse.data), // Converto os dados atualizados para o schema público (não tem erros)
    errors: [], //deixo o array de errors vazio (não tem erros)
    success: true, //e indico que aoperação foi bem sucedida
  };
}