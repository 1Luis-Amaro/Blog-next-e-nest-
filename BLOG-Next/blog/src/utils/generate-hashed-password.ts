import { hashPassword } from "@/lib/login/manage-login"

(async () => {
  const minhaSenha = '' //NÃO ESQUECER DE EXCLUIR A SENHA DAQUI
  const hashDaSuaSenhaEmBase64 = await hashPassword(minhaSenha)

  console.log({hashDaSuaSenhaEmBase64})
})()