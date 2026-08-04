type ApiRequestError = { //crio um type no typescript para manter uma regra
  errors: string []; //errors para virem um array de string
  success: false; //padronizo falando que o success é falso
  status: number; //e coloco o status como number pra vir um 500, 401 e assim por diante
};

type ApiRequestSuccess<T> = {//nesse type uso esse T pra deixar "flexível" porque ele é um tipo genérico, então dependendo de como o dado vier no "data" vou substituir T pelo tipo específico que chegar, podendo ser User, Post, Produto, etc
  data: T; //dado que vem no meu backend
  success: true; //aqui falo que o o sucesso da operação é true
  status: number; // e o status que vir tem que ser numerico
};

export type ApiRequest<T> = ApiRequestError | ApiRequestSuccess<T> //ai crio outro type nele posso ter tanto a Api de erro ou com sucesso

export const apiUrl = process.env.API_URL || 'http://localhost:3001'; // passando o caminho da minha api, que pode ser a api la do .env ou o padrao do localhost

export async function apiRequest <T> ( //crio uma funcao assincrona e com o T de tipo genérico que será definido quando a função for chamada
  path: string, //minha função tem esse parametro, que  caminho que e deve ser uma string, tipo: path = '/user'
  options?: RequestInit, //A função pode receber um parâmetro opcional chamado options, que deve ser um objeto com as configurações da requisição (método, cabeçalhos, corpo, etc)
) : Promise<ApiRequest<T>> { //A função retorna uma Promessa que, quando resolvida, vai ter um objeto do tipo ApiRequest que usa o tipo genérico T que defini
  const url = `${apiUrl}${path}` //aqui passo o caminho da minha api e mais o patch que vai ser /user por exemplo

  try{ //tento pegar um erro
    const res = await fetch(url, options) // faço uma busca na url e nas options
    const json = await res.json().catch(() => null) // tento converter a resposta para JSON, se der erro retorna null (para evitar que a aplicação quebre)

    if(!res.ok) { //se a res (a busca que eu fiz) não vier ok
      const errors = Array.isArray(json?.message) //verifico se o json.message realmente é um array, json.message é uma propriedade que o backend (NestJS) envia na resposta quando ocorre um erro. Ela contém a mensagem de erro que será exibida para o usuário
      ? json.message //se for um array uso ele diretamente
      : [json?.message || 'Erro inesperado'] //se for uma string ou undefined, coloco em um array com fallback

      return { //depois retorno
        errors, //os erros extraídos da resposta
        success: false, // a operação coloco que falhou
        status: res.status, // e o status da resposta
      }
    }
    return { // se a resposta foi bem-sucedida (res.ok = true)
      success: true, //coloco que a operação foi bem sucedida
      data: json, //pego o json que veio
      status: res.status, //o status da res

    }
  }catch(e) { // se ocorrer um erro de rede (servidor offline, timeout, etc)
    console.log(e) //no log do servidor vou mostrar que erro é esse

    return {
      errors: ['Falha ao conectar se ao servidor'], //erro genérico de conexão
      success: false, //a operação falhou
      status: 500, // erro interno (não conseguimos nem acessar o servidor)
    }
  }
}
