import { authenticatedApiRequest } from '@/utils/authenticated-api-request';
import { PublicUserDto, PublicUserSchema } from '../schemas';

export async function getPublicUserFromApi() { //função assincrona para pegar usuário lá da API
  const userResponse = await authenticatedApiRequest<PublicUserDto>( //vou fazer uma requisição estando autenticado do tipo de informação pública (PublicUserDto)
    `/user/me`, // caminho que vou pegar os dados do usuário autenticado
    {
      headers: { //cabeçalho da requisição
        'Content-Type': 'application/json', //dados vão ser do tipo json
      },
    },
  );

  if (!userResponse.success) { //se pegar o dados deu erro
    return undefined; // retorno undefined (indica que não conseguiu buscar o usuário)
  }

  return PublicUserSchema.parse(userResponse.data); // se deu tudo certo, converto os dados que peguei para o schema PublicUserSchema (garante que estão no formato correto)
}