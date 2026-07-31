// ==========================================
// IMPORTAÇÕES - Trazendo funcionalidades
// ==========================================

// Importa decorators e exceções do NestJS
// - Injectable: Marca a classe como um serviço que pode ser injetado
// - UnauthorizedException: Erro 401 - usuário não autorizado (login falhou)
import { Injectable, UnauthorizedException } from '@nestjs/common';

// Importa o DTO (Data Transfer Object) que define a estrutura dos dados de login
// DTO = esquema que valida os dados recebidos no corpo da requisição
// Exemplo: { email: "user@email.com", password: "123456" }
import { LoginDto } from './dto/login.dto';

// Importa o serviço de usuário para buscar dados no banco
// UserService contém métodos para: findByEmail, findById, create, save, etc.
import { UserService } from 'src/user/user.service';

// Importa o serviço de hashing (criptografia) para comparar senhas
// HashingService contém métodos para: hash (criptografar) e compare (verificar)
import { HashingService } from 'src/common/hashing/hashing.service';

// Importa o serviço JWT para gerar tokens
// JwtService contém métodos para: sign (gerar token) e verify (validar token)
import { JwtService } from '@nestjs/jwt';

// Importa o tipo que define a estrutura do payload do JWT
// JwtPayLoad = o que vai dentro do token: { sub: user.id, email: user.email }
import { JwtPayLoad } from './types/jwt-payload.type';

// ==========================================
// CLASSE: AuthService - Serviço de autenticação
// ==========================================

// @Injectable() - Marca a classe como um serviço que pode ser injetado
// Permite que o NestJS crie uma instância automaticamente quando necessário
// É usado em: AuthController (para login) e outros lugares
@Injectable()
export class AuthService {
  // ==========================================
  // CONSTRUTOR - Injeção de dependências
  // ==========================================

  constructor(
    // UserService: Serviço para manipular usuários no banco
    // Usado para: buscar usuário por email, salvar usuário, etc.
    private readonly userService: UserService,

    // HashingService: Serviço para criptografia/verificação de senhas
    // Usado para: comparar senha digitada com a senha hash do banco
    private readonly hashingService: HashingService,

    // JwtService: Serviço para gerar e validar tokens JWT
    // Usado para: criar o token de acesso (accessToken)
    private readonly jwtService: JwtService,
  ) {}

  // ==========================================
  // MÉTODO: login - Autentica um usuário
  // ==========================================

  // async: Este método é assíncrono porque faz operações demoradas:
  // 1. Busca no banco de dados (findByEmail)
  // 2. Compara senhas com hash (compare)
  // 3. Gera token JWT (signAsync)
  // 4. Salva no banco (save)
  //
  // Recebe: LoginDto (email e senha)
  // Retorna: { accessToken: "eyJhbGciOiJ..." }
  async login(loginDto: LoginDto) {
    // ==========================================
    // 1. BUSCA O USUÁRIO POR EMAIL
    // ==========================================

    // Tenta encontrar o usuário no banco pelo email
    // loginDto.email é o email enviado pelo cliente no corpo da requisição
    // Exemplo: "user@email.com"
    const user = await this.userService.findByEmail(loginDto.email);

    // Cria um erro padrão para ser usado em caso de falha
    // Reutilizamos a mesma mensagem para email inválido OU senha inválida
    // Isso é uma boa prática de segurança - não revela qual dos dois está errado
    const error = new UnauthorizedException('Usuário ou senha inválidos');

    // ==========================================
    // 2. VERIFICA SE O USUÁRIO EXISTE
    // ==========================================

    // Se o usuário NÃO existe no banco:
    // !user = true (usuário é null ou undefined)
    if (!user) {
      // Lança erro 401 (Unauthorized) com mensagem genérica
      // O cliente não sabe se o email está errado ou a senha
      throw error;
    }

    // ==========================================
    // 3. VERIFICA A SENHA
    // ==========================================

    // Compara a senha DIGITADA (loginDto.password) com a senha HASH (user.password)
    // hashingService.compare faz:
    // 1. Pega a senha digitada
    // 2. Aplica o mesmo hash que foi usado quando o usuário foi criado
    // 3. Compara com o hash armazenado no banco
    // 4. Retorna true se forem iguais, false se diferentes
    const isPassword = await this.hashingService.compare(
      loginDto.password, // Senha que o usuário digitou
      user.password, // Senha hash que está no banco
    );

    // Se a senha estiver ERRADA:
    if (!isPassword) {
      // Lança o mesmo erro de "Usuário ou senha inválidos"
      // O cliente não sabe se é o email ou a senha que está errado
      throw error;
    }

    // ==========================================
    // 4. CRIA O PAYLOAD DO TOKEN
    // ==========================================

    // Payload = dados que vão DENTRO do token JWT
    // O token vai carregar estas informações para serem usadas depois
    //
    // sub: ID do usuário (sub = subject = assunto do token)
    // email: Email do usuário para identificação
    //
    // ⚠️ IMPORTANTE: Não colocar dados sensíveis no token!
    // Exemplo: senha, CPF, dados bancários, etc.
    // Só colocar o necessário para identificar o usuário
    const jwtPayLoad: JwtPayLoad = {
      sub: user.id, // ID do usuário (vai ser usado para buscar no banco) - veio do banco essa informação
      email: user.email, // Email (para logs e identificação) - veio do banco essa informação
    };

    // ==========================================
    // 5. GERA O TOKEN JWT
    // ==========================================

    // jwtService.signAsync() gera um token JWT assinado
    // O token contém:
    // 1. O payload (dados do usuário)
    // 2. A data de criação (iat - issued at)
    // 3. A data de expiração (exp - expiration)
    // 4. A assinatura digital (usando JWT_SECRET)
    //
    // O token gerado é uma string codificada como:
    // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoidXNlckBlbWFpbC5jb20ifQ.assinatura
    // └── Cabeçalho ──┘ └────────── Payload ──────────┘ └─ Assinatura ─┘
    const accessToken = await this.jwtService.signAsync(jwtPayLoad);

    // ==========================================
    // 6. ATUALIZA O USUÁRIO
    // ==========================================

    // Define forceLogout como false (desativa logout forçado)
    // forceLogout é usado para invalidar tokens de um usuário específico
    // Exemplo: se um admin quiser deslogar alguém, seta forceLogout = true
    // Agora que o usuário fez login, ele está ativo novamente
    user.forceLogout = false;

    // Salva as alterações no banco de dados
    // Isso atualiza o campo forceLogout do usuário
    await this.userService.save(user);

    // ==========================================
    // 7. RETORNA O TOKEN
    // ==========================================

    // Retorna o token de acesso para o cliente
    // O cliente deve guardar este token e enviar em todas as requisições
    // protegidas no header: Authorization: Bearer <token>
    //
    // Exemplo de resposta:
    // {
    //   "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMTAyYjFjNi04ODAzLTQ5MTMtOWM3MC1iYWVlYzQyNjg4OWIiLCJlbWFpbCI6InVzZXJAZW1haWwuY29tIiwiaWF0IjoxNzgzMzY4MTg0LCJleHAiOjE3ODM0NTQ1ODR9.8V3wALAXeN7pDY6_d_XcVCxHpIdjcHfMY0UKSFBS3Kg"
    // }
    return { accessToken };
  }
}

// ==========================================
// FLUXO COMPLETO DO LOGIN
// ==========================================

// 1. Cliente envia POST /auth/login com JSON:
//    {
//      "email": "user@email.com",
//      "password": "123456"
//    }

// 2. AuthService.login() é chamado

// 3. Busca o usuário pelo email no banco
//    SELECT * FROM users WHERE email = 'user@email.com'

// 4. Usuário não encontrado? → Erro 401
//    Usuário encontrado? → Continua

// 5. Compara a senha digitada com a senha hash no banco
//    "123456" vs "$2b$10$..."

// 6. Senha errada? → Erro 401
//    Senha correta? → Continua

// 7. Cria o payload: { sub: user.id, email: user.email }

// 8. Gera o token JWT usando o JWT_SECRET

// 9. Atualiza forceLogout = false no banco

// 10. Retorna o token para o cliente

// 11. Cliente guarda o token e usa nas próximas requisições

// ==========================================
// O QUE É CADA COISA:
// ==========================================

// LoginDto: Define os campos esperados no login
//   - email: string (obrigatório)
//   - password: string (obrigatório)

// UserService: Serviço que gerencia usuários
//   - findByEmail: Busca usuário pelo email
//   - save: Salva/atualiza usuário no banco

// HashingService: Serviço de criptografia
//   - compare: Compara senha digitada com hash do banco

// JwtService: Serviço de tokens JWT
//   - signAsync: Gera um token JWT

// JwtPayLoad: Tipo que define o payload do token
//   - sub: ID do usuário
//   - email: Email do usuário

// ==========================================
// SEGURANÇA: POR QUE MENSAGEM GENÉRICA?
// ==========================================

// ❌ MENSAGEM ESPECÍFICA (INSEGURO):
// throw new UnauthorizedException('Email não encontrado');
// throw new UnauthorizedException('Senha incorreta');
//
// 😱 Problema: Um hacker pode descobrir se o email existe!
//    Tenta emails aleatórios e vê se a mensagem é diferente
//
// ✅ MENSAGEM GENÉRICA (SEGURO):
// throw new UnauthorizedException('Usuário ou senha inválidos');
//
// 😊 Vantagem: O hacker não sabe se o email ou a senha está errado
//    Mesmo que o email exista, a mensagem é a mesma
//    Isso protege contra ataques de enumeração de usuários

// ==========================================
// O QUE É forceLogout?
// ==========================================

// forceLogout = false → Usuário pode acessar a aplicação
// forceLogout = true  → Usuário NÃO pode acessar (mesmo com token válido)
//
// Usos:
// 1. Admin bloqueia um usuário
// 2. Usuário troca de senha em todos os dispositivos
// 3. Logout remoto (deslogar de todos os dispositivos)
//
// Como funciona:
// 1. Admin seta forceLogout = true no banco
// 2. Na próxima requisição, JwtStrategy.validate() vê forceLogout = true
// 3. Lança UnauthorizedException
// 4. Usuário é forçado a fazer login novamente
// 5. No login, setamos forceLogout = false

// ==========================================
// EXEMPLO DE RETORNO COMPLETO:
// ==========================================

// Quando o login é bem-sucedido:
// {
//   "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJlbWFpbCI6InVzZXJAZW1haWwuY29tIiwiaWF0IjoxNzgzMzY4MTg0LCJleHAiOjE3ODM0NTQ1ODR9.8V3wALAXeN7pDY6_d_XcVCxHpIdjcHfMY0UKSFBS3Kg"
// }

// O cliente então usa este token:
// Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// ==========================================
// DIAGRAMA DO FLUXO:
// ==========================================

// ┌─────────────────────────────────────────────────────────────┐
// │                    CLIENTE (Frontend)                     │
// └─────────────────────────────────────────────────────────────┘
//                              │
//                              ↓
//              POST /auth/login com { email, password }
//                              │
//                              ↓
// ┌─────────────────────────────────────────────────────────────┐
// │                    AUTH SERVICE                           │
// │  1. Busca usuário por email                               │
// │  2. Verifica se existe                                   │
// │  3. Compara senha                                        │
// │  4. Gera token JWT                                       │
// │  5. Atualiza forceLogout                                 │
// │  6. Retorna token                                        │
// └─────────────────────────────────────────────────────────────┘
//                              │
//                              ↓
//              Retorna: { accessToken: "eyJ..." }
//                              │
//                              ↓
// ┌─────────────────────────────────────────────────────────────┐
// │                    CLIENTE (Frontend)                     │
// │  1. Guarda o token                                        │
// │  2. Envia em todas as requisições:                       │
// │     Authorization: Bearer eyJ...                        │
// └─────────────────────────────────────────────────────────────┘
