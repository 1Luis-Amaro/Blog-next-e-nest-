'use server' // Avisa ao Next.js que esta função só roda no servidor

import { CreateUserSchema, PublicUserDto, PublicUserSchema } from "@/lib/user/schemas" // Importa os schemas de validação e os tipos de usuário
import { asyncDelay } from "@/utils/async-delay"; // Importa uma função que cria um delay (espera) artificial
import { getZodErrorMessages } from "@/utils/get-zod-error-messages"; // Importa a função que extrai as mensagens de erro do Zod

type CreateUserActionState = { //criando um type no typescript que me força a ter user errors e success
  user: PublicUserDto; // O objeto do usuário com os dados que podem ser expostos publicamente (id, name, email)
  errors: string[]; // Um array de strings que vai guardar todas as mensagens de erro que acontecerem
  success: boolean; // Um booleano que diz se a ação foi bem-sucedida (true) ou não (false)
};

export async function createUserAction( //// Criando a Server Action que vai processar a criação do usuário
  state: CreateUserActionState, // O estado atual da ação (vem do useActionState no frontend) com user, errors e success
  formData: FormData //Os dados do formulário que o usuário preencheu e enviou
): Promise<CreateUserActionState> { //prometo que as informações que vão me retornar nessa função são as do tipo do typescript que criei
   console.log('🚀 API_URL carregada:', process.env.API_URL);
  console.log('🚀 NODE_ENV:', process.env.NODE_ENV);
  await asyncDelay(3000); // Coloco um delay de 3 segundos pra simular uma requisição lenta (útil para teste de loading)

  if (!(formData instanceof FormData)) { // Se o formData que chegou na função NÃO for do tipo FormData (ou seja, se os dados vierem corrompidos)
    return {
      user: state.user, //// Retorna o estado atual do usuário (que veio do frontend, vazio ou com dados parciais)
      errors: ['Dados inválidos'],  // Mando um erro de "dados inválidos" para o frontend
      success: false, // E coloco que não teve sucesso (false)
    };
  }
  //formData.entries() - o entries le cada linha do formData e me devolve uma lista   //Object.fromEntries - aqui eu transformo a lista em objeto javascript
  const formObj = Object.fromEntries(formData.entries()); //  / Vou pegar os dados que vieram do formData e converter em um objeto JavaScript normal (ex: { name: 'João', email: 'joao@email.com' })
  const parsedFormData = CreateUserSchema.safeParse(formObj); //aqui pego o formData convertido e vou validar essas informações, pra fazer isso chamo o schema o CreateUserSchema que usa o Zod,
  //O safeParse NÃO LANÇA ERRO, ele retorna um objeto com .success e .data ou .error

  if (!parsedFormData.success) { //o parsedFormData passou por uma validação, safeParse me retorna um objeto com .success, .data ou .error, se o dado que passou pela validacao está errado o .success vai estar como false
    return {
      user: PublicUserSchema.parse(formObj), // mesmo com erro, crio um objeto de usuário público com os dados do formulário para reexibir no frontend (o que o usuário digitou)
      errors: getZodErrorMessages(parsedFormData.error.format()), //  Vou extrair todas as mensagens de erro que estão escritas no schema do Zod e colocar em um array de strings
      success: false, //e coloco false no success
    };
  }

  //FETCH API

  const apiUrl = process.env.API_URL || 'http://localhost:3001' // pego a URL da API do .env (ou uso o fallback localhost:3001)
  //const apiUrl = 'http://localhost:3001/user'

  try { // tento executar a requisição e capturar possíveis erros
    const response = await fetch(`${apiUrl}/user`, { //busco minha api que tem /user
      method: 'POST', //que tenha um metodo post
      headers: { // defino o cabeçalho da requisição
        'Content-Type': 'application/json', // informo que estou enviando JSON
      },
      body: JSON.stringify(parsedFormData.data) //pego os dados que JÁ FORAM validados pelo Zod e converto para string JSON para enviar no corpo da requisição
    })
    const json = await response.json() ///  converto a resposta do backend de JSON para objeto JavaScript

    if (!response.ok) { //se o json que veio não estiver ok
      console.log(json) //mostro o log do erro
      return { //e vou retornar o estado do erro
        user: PublicUserSchema.parse(formObj), //o forObj tem a lista de objeto que veio do formulario vou converter ele para meu schema que tem validacoes de login email e senha
        errors: json.message, //vou pegar a mensagem de erro que veio do backend
        success: false, //indico que a ação falhou
      }
    }

    console.log(json); // mostro a resposta de sucesso no console do servidor
      return {  //se passou do if acima
        user:PublicUserSchema.parse(formObj), // pego os dados que veio do formulário e converto para o schema publico
        errors: ['Success'], //O errors que vier vou colocar como Succes
        success: true, //indico que a ação foi bem-sucedida
      }
  } catch (e) { // se ocorrer um erro na requisição (ex: servidor offline)
    console.log(e) //mostro o log do erro no servidor
    return { // depois retorno o seguinte
      user: PublicUserSchema.parse(formObj), // pego os dados que veio do formulário e converto para o schema publico
      errors: ['Falha ao conectar-se ao Servidor'], //e retorno esse log já que não é um erro do lado do cliente
      success: false, //indico que a ação falhou
    }
  }

  // return {
  //   user: PublicUserSchema.parse(formObj), //agora se passar por todos esses if essas validações Retorno o estado do usuário (que veio do frontend, mas poderia ser o usuário criado)
  //   errors: ['Success'], //aqui coloco um array de erros vazio então não vai me trazer nada não tem erros para mostrar
  //   success: true, //success como true, indicando que a ação foi bem-sucedida

  // }

}


