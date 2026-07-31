// ==========================================
// IMPORTAÇÕES - Trazendo funcionalidades de outros lugares
// ==========================================

// Importa decorators e exceções do NestJS
// - Injectable: Marca a classe como um "serviço" que pode ser injetado em outros lugares
// - InternalServerErrorException: Erro 500 - erro interno do servidor
// - UnauthorizedException: Erro 401 - usuário não autorizado
import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';

// Importa a base para criar estratégias de autenticação com Passport
// PassportStrategy é uma classe que vamos estender (herdar)
import { PassportStrategy } from '@nestjs/passport';

// Importa funções do passport-jwt para extrair e validar o token JWT
// - ExtractJwt: Tem funções para pegar o token da requisição
// - Strategy: A classe base do JWT que vamos usar
import { ExtractJwt, Strategy } from 'passport-jwt';

// Importa o serviço de usuário para buscar dados no banco
import { UserService } from 'src/user/user.service';

// Importa o tipo (interface) que define a estrutura do payload do JWT
// Payload = dados que estão dentro do token
import { JwtPayLoad } from './types/jwt-payload.type';

// ==========================================
// DECLARAÇÃO DA CLASSE - Estratégia JWT
// ==========================================

// @Injectable() diz que esta classe pode ser injetada (usada) em outros lugares
// extends PassportStrategy(Strategy) herda tudo da classe Strategy do passport-jwt
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  // ==========================================
  // CONSTRUTOR - Roda quando a classe é criada
  // ==========================================

  // Recebe o UserService como dependência (injeção de dependência)
  // private readonly userService: UserService - cria uma propriedade privada e readonly (não pode ser alterada)
  constructor(private readonly userService: UserService) {
    // PEGA O SECRET DO ARQUIVO .ENV
    // process.env é um objeto que contém todas as variáveis de ambiente
    const secret = process.env.JWT_SECRET;

    // VALIDAÇÃO: Se o secret não existir, lança um erro
    // Isso é importante porque sem o secret, não conseguimos validar os tokens
    if (!secret) {
      // InternalServerErrorException = Erro 500
      // A aplicação NÃO DEVE iniciar sem o JWT_SECRET
      throw new InternalServerErrorException('JWT_SECRET not found in .env');
    }

    // ==========================================
    // CONFIGURAÇÃO DA ESTRATÉGIA (chama o construtor da classe pai)
    // ==========================================

    // super() chama o construtor da classe que estamos extendendo (PassportStrategy)
    // Passamos um objeto com as configurações:
    super({
      // jwtFromRequest: De onde o Passport vai pegar o token?
      // fromAuthHeaderAsBearerToken() = Do header Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // ignoreExpiration: Ignorar se o token expirou?
      // false = NÃO ignora, ou seja, se o token expirou, rejeita
      ignoreExpiration: false,

      // secretOrKey: A chave secreta usada para assinar/validar o token
      // Deve ser a MESMA chave usada para gerar o token no login
      secretOrKey: secret,
    });
  }

  // ==========================================
  // MÉTODO VALIDATE - Roda automaticamente quando um token é recebido
  // ==========================================

  // Este método é chamado pelo Passport APÓS ele validar o token
  // O payload são os dados que estavam dentro do token
  // O retorno deste método será anexado ao objeto req.user
  async validate(payload: JwtPayLoad) {
    // ==========================================
    // 1. BUSCA O USUÁRIO NO BANCO DE DADOS
    // ==========================================

    // payload.sub é o ID do usuário (sub = subject = assunto do token)
    // Busca o usuário pelo ID no banco de dados
    const user = await this.userService.findById(payload.sub);

    // ==========================================
    // 2. VALIDA SE O USUÁRIO EXISTE E ESTÁ AUTORIZADO
    // ==========================================

    // Verifica se:
    // - !user: Usuário não existe no banco
    // - user.forceLogout: Usuário foi forçado a fazer logout (ex: admin bloqueou)
    if (!user || user.forceLogout) {
      // Se qualquer uma das condições for verdadeira, lança erro 401
      // UnauthorizedException = Não autorizado
      throw new UnauthorizedException('Você precisa fazer login');
    }

    // ==========================================
    // 3. RETORNA O USUÁRIO
    // ==========================================

    // Se chegou aqui, o usuário está válido
    // O objeto retornado (user) será colocado em req.user
    // Assim os controllers podem acessar o usuário autenticado
    return user;
  }
}

// ==========================================
// FLUXO COMPLETO DE UMA REQUISIÇÃO AUTENTICADA:
// ==========================================

// 1. Cliente envia requisição com: Authorization: Bearer eyJhbGciOiJ...
// 2. Passport recebe a requisição e extrai o token
// 3. Passport valida o token usando o JWT_SECRET
// 4. Se o token é válido, extrai o payload (sub, email, etc)
// 5. Chama o método validate() passando o payload
// 6. validate() busca o usuário no banco pelo ID (payload.sub)
// 7. Se o usuário existe e não está em forceLogout, retorna o usuário
// 8. O usuário é anexado ao req.user
// 9. O controller pode acessar req.user para saber quem está autenticado
// 10. Se algo der errado em qualquer passo, retorna erro 401
