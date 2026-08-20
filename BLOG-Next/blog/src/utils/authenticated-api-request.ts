import 'server-only' //deixo uma regra de que esse componente so roda do lado do servidor
import { getLoginSessionForApi } from "@/lib/login/manage-login"
import { ApiRequest, apiRequest } from "./api-request"

export async function authenticatedApiRequest<T>( //crio uma funcao assincrona e com o T de tipo genérico que será definido quando a função for chamada
  path: string,  //minha função tem esse parametro, que  caminho que e deve ser uma string, tipo: path = '/user'
  options?: RequestInit, //A função pode receber um parâmetro opcional chamado options, que deve ser um objeto com as configurações da requisição (método, cabeçalhos, corpo, etc)
): Promise<ApiRequest<T>> { ////A função retorna uma Promessa que, quando resolvida, vai ter um objeto do tipo ApiRequest que usa o tipo genérico T que defini ou seja vai trazer ou o tipo de api com sucesso ou com erro


  const jwtToken = await getLoginSessionForApi() /// essa função da sessão de login da API pega o token JWT e é exatamente isso que estou fazendo quando chamo ela
  if (!jwtToken) { //se não tiver o token
    return { //vou retonar o seguinte
      success: false, // o success deixo como false
      errors: ['Usuário não autenticado.'], //no array de errors envio esse erro de usuário não autenticado ja que ele não tem o token
      status: 401, //e mando um status 401 que é unauthorized
    }
  }

  const headers = { // crio um objeto com os cabeçalhos que vão ser enviados na requisição
    ...options?.headers, //se tiver opções de cabeçalho, vou trazer essas informações
    Authorization: `Bearer ${jwtToken}`, // e incluo no Authorization o token que peguei no formato Bearer
  }

  return apiRequest<T>(path, { // por fim chamo a função apiRequest passando o caminho e as opções
    ...options, //trago todos os dados das opções que estavam preenchidos
    headers // e adiciono os cabeçalhos com o token
  })
}

