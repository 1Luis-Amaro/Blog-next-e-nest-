'use server' // Avisa ao Next.js que esta função só roda no servidor

import { CreateUserSchema, PublicUserDto, PublicUserSchema } from "@/lib/user/schemas" // Importa os schemas de validação e os tipos de usuário
import { apiRequest } from "@/utils/api-request";
import { asyncDelay } from "@/utils/async-delay"; // Importa uma função que cria um delay (espera) artificial
import { getZodErrorMessages } from "@/utils/get-zod-error-messages"; // Importa a função que extrai as mensagens de erro do Zod
import { verifyHoneypotInput } from "@/utils/verify-honeypot-input";
import { redirect } from 'next/navigation';
import { success } from "zod";

type CreateUserActionState = { //criando um type no typescript que me força a ter user errors e success
  user: PublicUserDto; // O objeto do usuário com os dados que podem ser expostos publicamente (id, name, email)
  errors: string[]; // Um array de strings que vai guardar todas as mensagens de erro que acontecerem
  success: boolean; // Um booleano que diz se a ação foi bem-sucedida (true) ou não (false)
};

export async function createUserAction( //// Criando a Server Action que vai processar a criação do usuário
  state: CreateUserActionState, // O estado atual da ação (vem do useActionState no frontend) com user, errors e success
  formData: FormData //Os dados do formulário que o usuário preencheu e enviou
): Promise<CreateUserActionState> { //prometo que as informações que vão me retornar nessa função são as do tipo do typescript que criei
const isBot = await verifyHoneypotInput(formData, 5000) // Verifica se é um bot: 1) se o campo honeypot foi preenchido, 2) se o formulário foi preenchido muito rápido (menos de 5 segundos). Se for bot, retorna true

if(isBot) {  // Se a verificação detectou que é um bot
  return{
    user: state.user, // Retorno o usuário preenchido (para reexibir no formulário)
    errors: ['nice'], // Retorno o usuário preenchido (para reexibir no formulário)
    success: false // E deixo o success como false (operação falhou)
  }
}
  //await asyncDelay(3000); // Coloco um delay de 3 segundos pra simular uma requisição lenta (útil para teste de loading)



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

  const createResponse = await apiRequest<PublicUserDto>('/user', { // chamo a apiRequest com o tipo genérico PublicUserDto (definindo que o data da resposta será um usuário público), e o caminho /user
    method: 'POST',// defino que o método HTTP é POST (para criar um novo recurso)
    headers: { // defino os cabeçalhos da requisição
      'Content-Type': 'application/json', // informo que estou enviando JSON
    },
    body: JSON.stringify(parsedFormData.data) // converto os dados que JÁ FORAM validados pelo Zod para string JSON e envio no corpo da requisição
  })

  if(!createResponse.success){ //se a resposta da requisição não foi um sucesso
    return { //retorno o estado do erro
      user: PublicUserSchema.parse(formObj),// converto os dados do formulário para o schema público (para reexibir o que o usuário digitou)
      errors: createResponse.errors, // pego o erro que veio da requisição
      success: createResponse.success, //pego o success que veio da requisição  que vai estar (false)

    }
  }


  redirect('/login?created=1')   // se deu tudo certo, redireciono o usuário para a página de login com o parâmetro created=1 na URL (para mostrar uma mensagem de sucesso)

  // return {
  //   user: PublicUserSchema.parse(formObj), //agora se passar por todos esses if essas validações Retorno o estado do usuário (que veio do frontend, mas poderia ser o usuário criado)
  //   errors: ['Success'], //aqui coloco um array de erros vazio então não vai me trazer nada não tem erros para mostrar
  //   success: true, //success como true, indicando que a ação foi bem-sucedida

  // }

}


