// ==========================================
// IMPORTAÇÕES - Trazendo funcionalidades de outros lugares
// ==========================================

// Importa tipos para manipular o contexto da requisição
// ExecutionContext: Dá acesso à requisição, resposta, e outros dados do ciclo de vida da requisição
// É usado para pegar informações como headers, parâmetros, etc.
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

// Importa o erro específico do JWT
// JsonWebTokenError: Erro lançado quando o token JWT é inválido
// Exemplos: token expirado, token malformado, assinatura inválida, etc.
import { JsonWebTokenError } from '@nestjs/jwt';

// Importa o AuthGuard base do Passport
// AuthGuard('jwt') é o guard padrão que já vem com o Passport
// Ele faz a validação básica do token JWT
import { AuthGuard } from '@nestjs/passport';

// ==========================================
// CLASSE: JwtAuthGuard - Guarda personalizado de autenticação
// ==========================================

// export: Torna a classe disponível para outros arquivos importarem
// class JwtAuthGuard: Define o nome da classe
// extends AuthGuard('jwt'): Herda tudo do AuthGuard padrão, mas podemos personalizar
// O 'jwt' é o nome da estratégia que definimos no JwtStrategy
export class JwtAuthGuard extends AuthGuard('jwt') {
  // ==========================================
  // MÉTODO: handleRequest - Personaliza o tratamento de erros
  // ==========================================

  // Este método é chamado pelo Passport DEPOIS de tentar validar o token
  // Ele permite que a gente personalize como lidar com sucesso/erro da autenticação
  //
  // 🎯 PROPÓSITO: Criar mensagens de erro mais amigáveis e consistentes
  //
  // Parâmetros:
  // - err: Erro que pode ter ocorrido durante a autenticação
  // - user: O usuário retornado pelo JwtStrategy.validate() (se bem-sucedido)
  // - info: Informações adicionais (ex: se token expirou, se é inválido, etc.)
  // - context: Contexto da requisição (headers, body, etc.)
  // - status: Status HTTP que seria retornado
  //
  // <TUser = any>: Tipo genérico - pode ser qualquer tipo, mas default é 'any'
  // Retorna: TUser (o usuário autenticado) ou lança exceção
  handleRequest<TUser = any>(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status?: any,
  ): TUser {
    // ==========================================
    // 1. VALIDAÇÃO PERSONALIZADA
    // ==========================================

    // !user: Se não tem usuário (token inválido ou não enviado)
    // info instanceof JsonWebTokenError: Se o token é inválido (expirado, assinatura errada, etc.)
    //
    // 🚨 O que acontece aqui?
    // - Se o token NÃO FOI ENVIADO: user = undefined, info = undefined
    // - Se o token é INVÁLIDO: user = undefined, info = JsonWebTokenError
    // - Se o token é VÁLIDO: user = { id, email, ... }, info = undefined
    if (!user || info instanceof JsonWebTokenError) {
      // Lança um erro 401 (Unauthorized) com mensagem personalizada
      // Isso é melhor que a mensagem padrão do Passport que é genérica
      throw new UnauthorizedException('Você precisa fazer login');
    }

    // ==========================================
    // 2. CHAMADA AO MÉTODO PAI (PADRÃO)
    // ==========================================

    // Se chegou aqui, o token é válido e o usuário existe
    // super.handleRequest() chama o método da classe pai (AuthGuard)
    // Ele vai:
    // 1. Verificar se o usuário é válido (já verificamos acima)
    // 2. Anexar o usuário à requisição (req.user)
    // 3. Retornar o usuário para ser usado nos controllers
    //
    // É aqui que o usuário é colocado no req.user!
    return super.handleRequest(err, user, info, context, status);
  }
}

// ==========================================
// FLUXO COMPLETO DE AUTENTICAÇÃO
// ==========================================

// 1. Cliente envia requisição com: Authorization: Bearer <token>
// 2. JwtAuthGuard entra em ação (usado com @UseGuards(JwtAuthGuard))
// 3. AuthGuard('jwt') chama o JwtStrategy
// 4. JwtStrategy extrai o token do header
// 5. JwtStrategy valida o token usando JWT_SECRET
// 6. JwtStrategy chama validate(payload) se o token for válido
// 7. validate() busca o usuário no banco
// 8. O resultado (user ou erro) é passado para handleRequest()
// 9. handleRequest() verifica se o usuário existe e token é válido
// 10. Se OK: retorna o usuário para ser anexado ao req.user
// 11. Se ERRO: lança UnauthorizedException com mensagem personalizada

// ==========================================

// ==========================================
// COMO USAR ESTE GUARD?
// ==========================================

// ✅ EM QUALQUER CONTROLLER:
// ---------------------------------
// @UseGuards(JwtAuthGuard)
// @Get('profile')
// getProfile(@Req() req: AuthenticatedRequest) {
//   return req.user; // 👈 O usuário autenticado!
// }

// ✅ EM VÁRIAS ROTAS:
// ---------------------------------
// @Controller('user')
// @UseGuards(JwtAuthGuard) // 👈 Protege TODAS as rotas deste controller
// export class UserController {
//   @Get('profile') // Também protegido
//   @Post('update') // Também protegido
// }

// ==========================================
// TIPOS DE ERRO DO JWT (JsonWebTokenError)
// ==========================================

// 1. TokenExpiredError: Token expirou
// 2. JsonWebTokenError: Token malformado ou inválido
// 3. NotBeforeError: Token ainda não está válido (nbf)
// 4. SyntaxError: Token não é um JWT válido
//
// Nosso guard trata TODOS eles da mesma forma:
// "Você precisa fazer login" 👈 Mensagem amigável

// ==========================================
// EXEMPLO DE USO NO CONTROLLER
// ==========================================

// import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
//
// @Controller('user')
// export class UserController {
//   @UseGuards(JwtAuthGuard) // 👈 Usando o guard personalizado
//   @Get('profile')
//   getProfile(@Req() req: AuthenticatedRequest) {
//     // Se chegou aqui, o usuário está autenticado!
//     return {
//       message: 'Perfil do usuário',
//       user: req.user
//     };
//   }
// }

// ==========================================
// DIFERENÇA ENTRE AuthGuard e JwtAuthGuard
// ==========================================

// AuthGuard('jwt') - BÁSICO (do Passport)
// ------------------------------------
// ✅ Valida o token
// ❌ Mensagens em inglês
// ❌ Sem personalização
// ❌ Trata todos os erros igual

// JwtAuthGuard - PERSONALIZADO (seu código)
// --------------------------------------
// ✅ Valida o token (herda do AuthGuard)
// ✅ Mensagens em português
// ✅ Personalização de erros
// ✅ Tratamento específico para token inválido
// ✅ Fácil de adicionar regras extras

// ==========================================
// 📝 RESUMO FINAL
// ==========================================

// O JwtAuthGuard é um "porteiro" que:
// 1. 🔒 Verifica se o visitante tem ingresso (token JWT)
// 2. 🎫 Confirma se o ingresso é válido (não expirado, assinatura correta)
// 3. 👤 Identifica quem é o visitante (busca no banco)
// 4. 🚫 Bloqueia quem não tem ingresso ou ingresso inválido
// 5. ✅ Libera a entrada e coloca o visitante no req.user
// 6. 💬 Dá uma mensagem amigável em português quando bloqueia
