import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from 'jose'
import { redirect } from "next/navigation"

const jwtSecretKey = process.env.JWT_SECRET_KEY //pegando minnha chave no env
const jwtEncodedKey = new TextEncoder().encode(jwtSecretKey) //codificando a chave que peguei

const loginExpSeconds = Number(process.env.LOGIN_EXPIRATION_SECONDS) || 86400 //definindo quanto tempo o login que foi feito vai expirar em segundos
const loginExpStr = process.env.LOGIN_EXPIRATION_STRING || '1d'  // pegando expiração em string ou colocando um por padrão
const loginCookieName = process.env.LOGIN_COOKIE_NAME || 'loginSession'  //pegando o nome do cookie la do meu arquivo .env ou colocando um por padrão

type JwtPayLoad = {  //defino um type, coloco regras em quem for usar esse type
  username: string, //então quem usar esse type tem que ter username por padrao
  expiresAt: Date // e a data de expiração
}

export async function hashPassword(password: string) { //criando minha função de transformação de senha e passo como parametro password (senha que o usuário digitou)
  const hash = await bcrypt.hash(password, 10) // // faço a transformação usando o bcrypt, passo a senha que o usuário digitou e o número 10 que é o custo do algoritmo (quantas rodadas de criptografia serão aplicadas, quanto maior, mais seguro e mais lento)
  const base64 = Buffer.from(hash).toString('base64') //converto o hash (que é uma string) para Base64, para poder salvar no banco de dados como texto (já que o hash do bcrypt contém caracteres especiais)
  return base64 //retorno por fim a tranformação final em Base64
}
export async function verifyPassword(password: string, base64Hash: string) { // crio uma função de verificação de senha, passo dois parâmetros: password (senha que o usuário digitou) e base64Hash (hash da senha que está no banco, guardado em Base64)
  const hash = Buffer.from(base64Hash, 'base64').toString('utf-8');// // pego o base64Hash que veio do banco (em Base64), decodifico de volta para binário e converto para string UTF-8 (que é o hash real da senha)
  return bcrypt.compare(password, hash) //// comparo a senha que o usuário digitou (em texto puro) com o hash que está no banco (já decodificado). O bcrypt faz a comparação de forma segura (protegida contra ataques de tempo)
}

export async function createLoginSession(username: string) { //criado a sessão de login, como parametro uso o username digitado
  const expiresAt = new Date(Date.now() + loginExpSeconds * 1000) // crio a data de expiração do login: pego a data/hora atual (Date.now()) e somo com o tempo de expiração (loginExpSeconds) que está em segundos, multiplico por 1000 para converter para milissegundos (já que Date.now() trabalha com milissegundos)
  const loginSession = await signJwt({username, expiresAt}) //pego o username digitado e o tempo de expiração e crio um token JWT (assinado digitalmente) contendo essas informações
  const cookieStore = await cookies() // vou buscar o gerenciador de cookies do Next.js (que permite ler e escrever cookies no servidor)

  cookieStore.set(loginCookieName, loginSession, { //no meu cookie vou colocar o seguinte, o nome nele com o loginCookieName, e
    httpOnly: true,// o cookie não pode ser acessado por JavaScript no navegador (protege contra ataques XSS)
    secure: true, /// o cookie só será enviado em conexões HTTPS (protege contra ataques de interceptação)
    sameSite: 'strict',  // o cookie só é enviado quando a requisição vem do mesmo site (protege contra ataques CSRF)
    expires: expiresAt,// defino a data de expiração do cookie (quando ele será automaticamente removido)
  })

}

export async function createLoginSessionFromApi(jwt: string) {  // crio a sessão de login da API, passando como parâmetro a string jwt (token que veio do backend)
  const expiresAt = new Date(Date.now() + loginExpSeconds * 1000); // crio a data de expiração do login: pego a data/hora atual (Date.now()) e somo com o tempo de expiração (loginExpSeconds) que está em segundos, multiplico por 1000 para converter para milissegundos (já que Date.now() trabalha com milissegundos)
  const loginSession = jwt; // renomeio o parâmetro jwt para loginSession para manter o padrão do código (é o mesmo valor, só mudo o nome da variável)
  const cookieStore = await cookies(); // vou buscar o gerenciador de cookies do Next.js (que permite ler e escrever cookies no servidor)

  cookieStore.set(loginCookieName, loginSession, { //vou colocar naquele cookie o seguinte, um nome para o cookie e o jwt
    httpOnly: true,// o cookie não pode ser acessado por JavaScript no navegador (protege contra ataques XSS)
    secure: true, /// o cookie só será enviado em conexões HTTPS (protege contra ataques de interceptação)
    sameSite: 'strict',  // o cookie só é enviado quando a requisição vem do mesmo site (protege contra ataques CSRF)
    expires: expiresAt,// defino a data de expiração do cookie (quando ele será automaticamente removido)
  });
}


export async function deleteLoginSession() { //função para deletar uma sessão de login
  const cookieStore = await cookies() //busco o gerenciador de cookies do next que me permite ler e escrever cookies
  cookieStore.set(loginCookieName, '', { expires: new Date(0) }) //acho um cookie que está vazio e sobreescrevo ele, como passei 0 para o new date ele puxa uma data mais antiga possivel, dessa forma eu forço o navegador a remover o cookie
  cookieStore.delete(loginCookieName) // deleto oficialmente o cookie usando o método delete do Next.js (remove o cookie do navegador)
}

export async function getLoginSession () { //pegar a sessão do login
  const cookieStore = await cookies() //busco o gerenciador de cookies do next que permite ler e escrever cookies

  const jwt = cookieStore.get(loginCookieName)?.value /// busco no gerenciador de cookies o cookie que tem o nome loginCookieName, e pego o valor dele (o token JWT). O `?.` (optional chaining) faz com que se o cookie não existir, retorna undefined em vez de dar erro

  if(!jwt) return false // se não veio valor (jwt é undefined ou null), retorno false (indicando que o usuário não está logado)

  return verifyJwt(jwt) //  uso a função de verificação para validar o token JWT e retornar os dados do usuário (se for válido) ou false (se for inválido)
}

export async function getLoginSessionForApi() { //pegar a sessão da api
  const cookieStore = await cookies() //busco o gerenciador de cookies do next que permite ler e escrever cookies

  const jwt = cookieStore.get(loginCookieName)?.value /// busco no gerenciador de cookies o cookie que tem o nome loginCookieName, e pego o valor dele (o token JWT). O `?.` (optional chaining) faz com que se o cookie não existir, retorna undefined em vez de dar erro

  if(!jwt) return false // se não veio valor (jwt é undefined ou null), retorno false (indicando que o usuário não está logado)

  return jwt; //retorno o jwt que veio
}

 export async function verifyLoginSession() {  // função para verificar se a sessão de login é válida (se o usuário está logado e é o usuário correto)
  const jwtPayLoad = await getLoginSession() //pego o payload (dados) do JWT que já foi validado pela função getLoginSession(). Se o token for inválido ou expirado, retorna false

  if(!jwtPayLoad) return false // se o jwtPayLoad for false (token inválido, expirado ou inexistente), retorno false para indicar que a sessão NÃO é válida

  return jwtPayLoad?.username === process.env.LOGIN_USER // comparo o username que está dentro do JWT (payload) com o username que está no .env (LOGIN_USER). Se forem iguais, retorno true (login válido). Se forem diferentes ou o JWT não tiver username, retorno false

 }

 export async function requireLoginSessionOrRedirect() {// vou requerer o login da sessão ou vou redirecionar
  const isAuthenticated = await verifyLoginSession() //passo minha verificação de sessão para uma const

  if(!isAuthenticated) { //se não vier nada ou não existir dados da verificação
    redirect('/admin/login') //vou redirecionar a pessoa para a pagina de login
  }
 }

 export async function requireLoginSessionForApiOrRedirect() { //vou requerer o login da sessão ou vou redirecionar isso ja da parte do backend
  const isAuthenticated = await getLoginSessionForApi(); //tento buscar o jwt

  if (!isAuthenticated) { //se tiver não tiver nenhum jwt eu redireciono a pessoa para login
    redirect('/login');
  }
}

export async function signJwt (jwtPayLoad: JwtPayLoad) { //função para assinar o jwt, passo um parametro do tipo jwtPayload que obriga usar coisas desse tipo
  return new SignJWT(jwtPayLoad) //// Crio um novo objeto do tipo SignJWT (da biblioteca jose) e os dados do jwt que no caso foi username e data de expiração
    .setProtectedHeader({ //no header do jwt
      alg: 'HS256', // Algoritmo de criptografia (HS256 = HMAC com SHA-256)
      typ: 'JWT' // Tipo do token (JWT = JSON Web Token)
    })
    .setIssuedAt() //Adiciona a data/hora atual como "data de emissão" do token
    .setExpirationTime(loginExpStr) //coloco no jwt a expiração em string quando vai se tornar invalido
    .sign(jwtEncodedKey) //assino a chave do .env que codifiquei em base 64
}

export async function verifyJwt(jwt: string | undefined = '') { //função para verificar jwt
  try {
    const {payload} = await jwtVerify(jwt, jwtEncodedKey, { //tento pegar o payload do jwt, uso a função do jwt para verificar, verifico o jwt, a senha que foi codificada em base 64
      algorithms: ['HS256'], //e o algoritimo de criptografia
    })
    return payload //apos verificar retorno o payload validados
  }catch{
    console.log('Ivalid Token') //se eu pegar um erro envio um log para o servidor falando que o token é invalido
    return false //e retorno que a verificação deu erro
  }
}