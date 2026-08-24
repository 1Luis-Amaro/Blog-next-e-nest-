'use server'

import { getLoginSessionForApi } from "@/lib/login/manage-login";
import { authenticatedApiRequest } from "@/utils/authenticated-api-request";
import { mkdir, writeFile } from "fs/promises";
import { extname, resolve } from "path";

type UploadImageActionResult = {  // Crio um tipo para definir a estrutura do resultado da ação de upload
  url: string; // A URL da imagem após o upload (se for bem-sucedido)
  error: string; // Mensagem de erro (se houver)

}


export async function uploadImageAction(formData: FormData): Promise<UploadImageActionResult> {  // Função que faz o upload da imagem, prometo que vai retornar um objeto do tipo UploadImageActionResult
  const makeResult = ({ url = '', error = '' }) => ({ url, error }) // Função auxiliar que cria o objeto de resultado com url e error (valores padrão vazios)

  const isAuthenticated = await getLoginSessionForApi() // Pego o token JWT do usuário para verificar se está autenticado


if (!isAuthenticated) { // Se NÃO estiver autenticado (token inválido ou expirado)
     return makeResult({error: 'Faça login novamente '}) // Retorno erro pedindo para fazer login novamente

    }

  if (!(formData instanceof FormData)) { // Se o formData NÃO for um objeto FormData válido
    return makeResult({ error: 'Dados inválidos' })  // Retorno erro de dados inválidos
  }

  const file = formData.get('file') // Pego o arquivo do formulário (campo com nome 'file')

  if (!(file instanceof File)) { // Se o arquivo NÃO for uma instância de File (não é um arquivo válido)
    return makeResult({ error: "Arquivo Inválido" }) // Retorno erro de arquivo inválido
  }

  const uploadMaxSize = Number(process.env.NEXT_PUBLIC_IMAGE_UPLOAD_MAX_SIZE) || 921600 /// Pego o tamanho máximo do arquivo do .env ou uso o valor padrão 921600
  if (file.size > uploadMaxSize) {  // Se o tamanho do arquivo for maior que o máximo permitido
    return makeResult({ error: "Arquivo muito grande" }) //lanço um erro de arquivo muito grande

  }

  if (!file.type.startsWith('image/')) {// se o tipo do arquivo que vier não começar com image/ isso que dizer que a imagem não é valida
    return makeResult({ error: "Imagem inválida" }) //então lanço esse erro pro usuário

  }


  const uploadResponse = await authenticatedApiRequest<{ url: string }>( // Faço uma requisição autenticada para a API, e o retorno será um objeto com a URL da imagem
    `/upload`, // Caminho da API para upload de imagens
    {
      method: 'POST', // Método HTTP POST (enviar dados)
      body: formData, // Corpo da requisição é o FormData (não é JSON, é multipart/form-data)
    },
  );

  if (!uploadResponse.success) { // Se a API NÃO retornou sucesso
    return makeResult({ error: uploadResponse.errors[0] }); // Retorno o primeiro erro que veio da API
  }

  const url = `${process.env.IMAGE_SERVER_URL}${uploadResponse.data.url}`; // Construo a URL completa da imagem: URL base do servidor + caminho da imagem

  return makeResult({ url }); /// Retorno o objeto com a URL da imagem
}