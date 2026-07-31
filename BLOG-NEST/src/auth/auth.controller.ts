// ==========================================
// IMPORTAÇÕES - Trazendo funcionalidades de outros lugares
// ==========================================

// Importa decorators do NestJS para criar controladores e rotas
// - Body: Pega os dados do corpo da requisição (JSON enviado no POST)
// - Controller: Marca a classe como um controlador (recebe requisições HTTP)
// - Post: Define uma rota que responde a requisições POST
import { Body, Controller, Post, UseGuards } from '@nestjs/common';

// Importa o AuthService (serviço de autenticação)
// AuthService contém a lógica de negócio para login
// É onde a "mágica" acontece: verifica usuário, senha e gera token
import { AuthService } from './auth.service';

// Importa o DTO (Data Transfer Object) de login
// DTO = define a estrutura dos dados que o cliente DEVE enviar
// LoginDto contém: email (string) e password (string)
// O NestJS vai validar automaticamente se os campos estão presentes
import { LoginDto } from './dto/login.dto';

// ==========================================
// DECLARAÇÃO DO CONTROLADOR
// ==========================================

// @Controller('auth') - Define que TODAS as rotas começam com /auth
//
// Exemplo:
// - /auth/login (rota que vamos criar)
// - /auth/logout (se tivesse)
// - /auth/refresh (se tivesse)
//
// O prefixo é automaticamente adicionado a todas as rotas
// Então @Post('login') vira /auth/login
@Controller('auth') // auth/login
export class AuthController {
  // ==========================================
  // CONSTRUTOR - Injeção de dependências
  // ==========================================

  // O construtor recebe o AuthService como dependência
  // private readonly = cria uma propriedade privada que não pode ser alterada
  // authService: O serviço que contém a lógica de login
  //
  // O NestJS vai automaticamente fornecer uma instância do AuthService
  // Isso é chamado de "Injeção de Dependência" (DI)
  constructor(private readonly authService: AuthService) {}
  //      ↑
  //      SERVICO INJETADO: O controller pode usar this.authService

  // ==========================================
  // ROTA: POST /auth/login - Fazer login
  // ==========================================

  // @Post('login') - Define que esta rota responde a POST
  // O caminho completo é /auth/login
  // Por que POST? Porque estamos enviando dados (email e senha)
  //
  // O que acontece quando um cliente acessa esta rota?
  // 1. O cliente envia uma requisição POST para /auth/login
  // 2. O corpo da requisição deve conter JSON com email e senha
  // 3. O NestJS vai validar os dados com o LoginDto
  // 4. Se os dados forem válidos, chama este método
  // 5. O método chama o AuthService para processar o login
  // 6. O AuthService retorna o token
  // 7. O controller retorna o token para o cliente
  @Post('login')
  //                                        ↓
  // @Body() - Pega os dados do corpo da requisição
  // O corpo da requisição (body) é onde o cliente envia os dados
  // Exemplo de corpo:
  // {
  //   "email": "joao@email.com",
  //   "password": "123456"
  // }
  //
  // loginDto: LoginDto - O DTO que valida os dados
  // O NestJS vai:
  // 1. Pegar o JSON do corpo
  // 2. Converter para um objeto
  // 3. Validar se tem os campos obrigatórios (email, password)
  // 4. Criar uma instância de LoginDto
  // 5. Passar para o método
  //
  // Se faltar algum campo, o NestJS automaticamente retorna erro 400
  // Sem precisar de código adicional! (validação automática)
  login(@Body() loginDto: LoginDto) {
    // ==========================================
    // CHAMA O SERVIÇO DE AUTENTICAÇÃO
    // ==========================================

    // this.authService.login(loginDto) - Chama o serviço
    // O serviço vai:
    // 1. Buscar o usuário pelo email no banco
    // 2. Verificar se o usuário existe
    // 3. Comparar a senha digitada com o hash do banco
    // 4. Se tudo certo, gerar um token JWT
    // 5. Atualizar forceLogout = false
    // 6. Retornar o token
    //
    // Retorna para o cliente:
    // {
    //   "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    // }
    return this.authService.login(loginDto);
  }
}

// ==========================================
// RESUMO DAS ROTAS DISPONÍVEIS
// ==========================================

// 1. POST /auth/login - Login do usuário (público)
//    Enviar: { email: "user@email.com", password: "123456" }
//    Retorna: { accessToken: "eyJ..." }

// ==========================================
// O QUE É CADA COISA?
// ==========================================

// Controller: Controlador - Recebe requisições HTTP
// Service: Serviço - Contém a lógica de negócio (login, logout, etc.)
// DTO: Data Transfer Object - Define a estrutura dos dados recebidos
// @Controller: Define o prefixo da rota
// @Post: Define o método HTTP POST
// @Body: Pega os dados do corpo da requisição
// constructor: Injeção de dependência do serviço

// ==========================================
// FLUXO DE UMA REQUISIÇÃO DE LOGIN
// ==========================================

// 1. Cliente envia POST /auth/login com JSON:
//    {
//      "email": "joao@email.com",
//      "password": "123456"
//    }

// 2. @Controller('auth') + @Post('login')
//    → Rota: /auth/login

// 3. @Body() loginDto: LoginDto
//    → Pega os dados do corpo da requisição
//    → Valida se tem email e password
//    → Se faltar campo → erro 400

// 4. this.authService.login(loginDto)
//    → Chama o serviço de autenticação
//    → Processa o login (verifica email, senha, gera token)

// 5. Retorna o token:
//    {
//      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
//    }

// ==========================================
// O QUE O CLIENTE FAZ COM O TOKEN?
// ==========================================

// 1. Guarda o token (localStorage, sessionStorage, cookies, etc.)
// 2. Envia em todas as requisições protegidas
// 3. Adiciona no header: Authorization: Bearer <token>
//
// Exemplo:
// GET http://localhost:3000/user/profile
// Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// ==========================================
// BOAS PRÁTICAS IMPLEMENTADAS
// ==========================================

// 1. ✅ Nome da rota clara e intuitiva (/auth/login)
// 2. ✅ Uso de DTO para validar dados
// 3. ✅ Separação de responsabilidades (Controller + Service)
// 4. ✅ Injeção de dependência correta
// 5. ✅ Método POST para envio de dados sensíveis
// 6. ✅ Código limpo e organizado
// 7. ✅ Controller focado em receber requisições e chamar serviços
