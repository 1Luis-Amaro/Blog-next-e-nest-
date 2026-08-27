'use server'

import { createLoginSessionFromApi } from "@/lib/login/manage-login";
import { LoginSchema } from "@/lib/login/schema";
import { PublicUserSchema } from "@/lib/user/schemas";
import { apiRequest } from "@/utils/api-request";
import { asyncDelay } from "@/utils/async-delay"
import { getZodErrorMessages } from "@/utils/get-zod-error-messages";
import { verifyHoneypotInput } from "@/utils/verify-honeypot-input";
import { redirect } from 'next/navigation';
type LoginActionState = { //criando um type para que tenha um padrão a seguir
  email: string; //coloco um e-mail
  errors: string[]; //e um array de string
}

export async function loginAction(state: LoginActionState, formData: FormData) { //criei uma função assincrona e passei pra ela o parametro state, e o state tem o type que criei então tem que ter duas funcionalidades por padrao, e depois passei outro parametro que são os dados do formularios
   const allowLogin = Boolean(Number(process.env.ALLOW_LOGIN)); // verifico se o login está permitido pelo .env. Uso Number() para converter a string do .env ("1" ou "0") em número, e Boolean() para converter em true/false

  if (!allowLogin) { //se o login não está permitido
    return { //vou retornar o seguinte
      email: '', //e-mail vazio
      errors: ['Login not allowed'], //e a mensagem de login não permitido
    };
  }
 // await asyncDelay(5000) //Vou manter dessa forma pra quem tentar atacar o sistema nao consiga por exemplo
 const isBot = await verifyHoneypotInput(formData, 5000) // Verifica se é um bot: 1) se o campo honeypot foi preenchido, 2) se o formulário foi preenchido muito rápido (menos de 5 segundos). Se for bot, retorna true

if(isBot) {  // Se a verificação detectou que é um bot
  return{
    email: '', // Retorno o e-mail preenchido (para reexibir no formulário)
    errors: ['nice'], // Retorno o usuário preenchido (para reexibir no formulário)
  }
}

  if (!(formData instanceof FormData)) { //se o formData não for um formulário
    return { //retorno o seguinte
      email: '', //email vazio
      errors: ['Dados inválidos'] //e a mensagem de dados invalidos
    }
  }

  //VALIDAR
  const formObj = Object.fromEntries(formData.entries()) //o entries le todos os dados que vieram e converte os dados que veio do form em uma lista, Vou pegar os dados que vieram do formData e converter em um objeto JavaScript normal (ex: { name: 'João', email: 'joao@email.com' })
  const formEmail = formObj?.email?.toString() || '' // pego o email do objeto (se existir) e converto para string, se não existir ou for undefined, uso string vazia como fallback
  const parsedFormData = LoginSchema.safeParse(formObj) //valido com os zod os dados que vieram do formulário

  if(!parsedFormData.success){ //se os dados não foram validados corretamente
    return { //vou retornar o seguinte
      email: formEmail,// o e-mail enviado
      errors: getZodErrorMessages(parsedFormData.error.format()),//  Vou extrair todas as mensagens de erro que estão escritas no schema do Zod e colocar em um array de strings
    }
  }

  //fetch
  const loginResponse = await apiRequest<{accessToken: string}> ('/auth/login', { // chamo a apiRequest com o tipo genérico PublicUserDto (definindo que o data da resposta será um usuário público), e o caminho /user
      method: 'POST',// defino que o método HTTP é POST (para criar um novo recurso)
      headers: { // defino os cabeçalhos da requisição
        'Content-Type': 'application/json', // informo que estou enviando JSON
      },
      body: JSON.stringify(parsedFormData.data) // converto os dados que JÁ FORAM validados pelo Zod para string JSON e envio no corpo da requisição
    })

    if(!loginResponse.success){ //se a resposta da requisição não foi um sucesso
      return { //retorno o estado do erro
        email: formEmail,// converto os dados do formulário para o schema público (para reexibir o que o usuário digitou)
        errors: loginResponse.errors, //pego o success que veio da requisição  que vai estar (false)

      }
    }

    console.log(loginResponse.data)

    await createLoginSessionFromApi(loginResponse.data.accessToken)
    redirect('/admin/post')
  }
// await createLoginSession(email)
// redirect('/admin/post')
// }