import 'server-only'
import { getLoginSessionForApi } from "@/lib/login/manage-login"
import { ApiRequest, apiRequest } from "./api-request"

export async function authenticatedApiRequest<T>(
  path: string,
  options?: RequestInit,
): Promise<ApiRequest<T>> {


  const jwtToken = await getLoginSessionForApi()

  if (!jwtToken) {
    return {
      success: false,
      errors: ['Usuário não autenticado.'],
      status: 401,
    }
  }

  const headers = {
    ...options?.headers, //pego o header que a pessoa envio
    Authorization: `Bearer ${jwtToken}`, //e incluo no autorization o token que peguei
  }

  return apiRequest<T>(path, {
    ...options,
    headers
  })
}

