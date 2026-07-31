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

  const apiUrl = process.env.API_URL || 'http://localhost:3001'
  //const apiUrl = 'http://localhost:3001/user'

  try {
    const response = await fetch(`${apiUrl}/user`, {
      method: 'POST',
      headers: {
        'Contente-Type': 'application/json',
      },
      body: JSON.stringify(parsedFormData.data)
    })
    const json = await response.json()

    if (!response.ok) {
      console.log(json)
      return {
        user: PublicUserSchema.parse(formObj),
        errors: json.message,
        success: false,
      }
    }

      return {
        user:PublicUserSchema.parse(formObj),
        errors: ['Success'],
        success: true,
      }
  } catch (e) {
    console.log(e)
    return {
      user: PublicUserSchema.parse(formObj),
      errors: ['Falha ao conectar-se ao Servidor'],
      success: false, //,
    }
  }

  // return {
  //   user: PublicUserSchema.parse(formObj), //agora se passar por todos esses if essas validações Retorno o estado do usuário (que veio do frontend, mas poderia ser o usuário criado)
  //   errors: ['Success'], //aqui coloco um array de erros vazio então não vai me trazer nada não tem erros para mostrar
  //   success: true, //success como true, indicando que a ação foi bem-sucedida

  // }

}


