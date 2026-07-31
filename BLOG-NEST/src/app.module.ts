// ==========================================
// IMPORTAÇÕES - Trazendo funcionalidades
// ==========================================

// Importa o decorator Module do NestJS
// @Module() - Define que esta classe é um módulo
// AppModule é o MÓDULO PRINCIPAL (raiz) da aplicação
// Toda aplicação NestJS tem pelo menos um módulo: o AppModule
import { Module } from '@nestjs/common';

// Importa o AppController (controlador principal)
// Gerencia as rotas da raiz da aplicação (ex: GET /)
// Contém rotas como: GET / (health check, status, etc.)

// Importa o AppService (serviço principal)
// Contém a lógica de negócio da aplicação
// Exemplo: mensagem de boas-vindas, status da aplicação, etc.

// Importa o AuthModule (módulo de autenticação)
// Gerencia tudo sobre: login, logout, tokens JWT, etc.
// Contém: AuthController, AuthService, JwtStrategy, JwtAuthGuard
import { AuthModule } from './auth/auth.module';

// Importa o UserModule (módulo de usuários)
// Gerencia tudo sobre: criação, busca, atualização de usuários
// Contém: UserController, UserService, User entity
import { UserModule } from './user/user.module';

// Importa o PostModule (módulo de posts)
// Gerencia tudo sobre: criação, listagem, atualização de posts
// Contém: PostController, PostService, Post entity
import { PostModule } from './post/post.module';

// Importa o ConfigModule do NestJS
// Gerencia variáveis de ambiente (.env)
// Permite acessar: process.env.JWT_SECRET, process.env.DB_TYPE, etc.
import { ConfigModule } from '@nestjs/config';

// Importa o TypeOrmModule do NestJS
// Gerencia a conexão com o banco de dados
// Permite usar: TypeORM (SQLite, PostgreSQL, MySQL, etc.)
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadModule } from './upload/upload.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

// ==========================================
// DECLARAÇÃO DO MÓDULO - AppModule
// ==========================================

// @Module() - Define a configuração do módulo principal
// O AppModule é o PONTO DE ENTRADA da aplicação
// Ele importa TODOS os outros módulos e configurações globais
@Module({
  // ==========================================
  // IMPORTS - Módulos que a aplicação PRECISA
  // ==========================================

  imports: [
    // ==========================================
    // 1. AuthModule - MÓDULO DE AUTENTICAÇÃO
    // ==========================================
    // O que faz: Gerencia autenticação da aplicação
    //
    // Disponibiliza:
    // - Login (POST /auth/login)
    // - Logout (POST /auth/logout)
    // - JWT Strategy (validação de tokens)
    // - JWT Guard (proteção de rotas)
    //
    // Por que importar? Para a aplicação ter autenticação!
    // Sem ele, não teríamos login nem proteção de rotas
    AuthModule,

    // ==========================================
    // 2. UserModule - MÓDULO DE USUÁRIOS
    // ==========================================
    // O que faz: Gerencia usuários da aplicação
    //
    // Disponibiliza:
    // - Criação de usuários (POST /user)
    // - Busca de usuários (GET /user/:id)
    // - Perfil do usuário (GET /user/me)
    // - UserService (para outros módulos usarem)
    //
    // Por que importar? Para a aplicação ter usuários!
    // Sem ele, não teríamos usuários cadastrados
    UserModule,

    // ==========================================
    // 3. PostModule - MÓDULO DE POSTS
    // ==========================================
    // O que faz: Gerencia posts (publicações)
    //
    // Disponibiliza:
    // - Criação de posts (POST /post)
    // - Listagem de posts (GET /post)
    // - Busca de post (GET /post/:id)
    // - Atualização de post (PATCH /post/:id)
    // - Deleção de post (DELETE /post/:id)
    //
    // Por que importar? Para a aplicação ter posts!
    // Sem ele, não teríamos funcionalidade de posts
    PostModule,

    // ==========================================
    // 4. ConfigModule.forRoot() - CONFIGURAÇÃO GLOBAL
    // ==========================================
    // O que faz: Carrega as variáveis de ambiente (.env)
    //
    // forRoot() = Configuração global do módulo
    // isGlobal: true = Torna o módulo disponível em TODA aplicação
    //
    // Com isso, podemos usar process.env em QUALQUER lugar:
    // - JWT_SECRET (segredo do token)
    // - DB_TYPE (tipo de banco)
    // - DB_HOST (host do banco)
    // - PORT (porta da aplicação)
    //
    // Sem isso, as variáveis de ambiente NÃO seriam carregadas!
    // A aplicação não saberia como se conectar ao banco!
    ConfigModule.forRoot({
      isGlobal: true, // 👈 DISPONÍVEL EM TODA APLICAÇÃO!
    }),
    ThrottlerModule.forRoot({
      // Chama o modulo de limite de requisições
      throttlers: [
        // Configuração dos limitadores
        {
          // Início das configurações
          ttl: 10000, // tempo em milissegundos que conta as requisições (10 segundos)
          limit: 10, // numero maximo de requisições permitidas no tempo definido pelo ttl
          blockDuration: 5000, // tempo em milissegundos que o usuario fica bloqueado se exceder o limite (5 segundos)
        }, // Fecha as configurações
      ], // Fecha os limitadores
    }), // Fecha o modulo
    // ==========================================
    // 5. TypeOrmModule.forRootAsync() - BANCO DE DADOS
    // ==========================================
    // O que faz: Configura a conexão com o banco de dados
    //
    // forRootAsync() = Configuração assíncrona e dinâmica
    // O uso de Async permite decidir a configuração em tempo de execução
    //
    // useFactory() = Função que PRODUZ a configuração
    // Decide qual banco usar baseado no .env
    //
    // Suporta múltiplos bancos:
    // - SQLite (desenvolvimento/testes) - arquivo local
    // - PostgreSQL (produção) - servidor remoto
    //
    // ⚠️ IMPORTANTE: A configuração é lida do .env!
    // Mudando o .env, mudamos o banco sem recompilar!
    TypeOrmModule.forRootAsync({
      // useFactory = Fábrica de configuração do banco
      // É uma função que RETORNA a configuração correta
      useFactory: () => {
        // ==========================================
        // LENDO AS VARIÁVEIS DE AMBIENTE
        // ==========================================

        // process.env.DB_TYPE = 'better-sqlite3' ou 'postgres'
        // Vem do arquivo .env na raiz do projeto

        // ==========================================
        // DECISÃO: QUAL BANCO USAR?
        // ==========================================

        // SE for SQLite:
        if (process.env.DB_TYPE === 'better-sqlite3') {
          // ==========================================
          // CONFIGURAÇÃO DO SQLITE
          // ==========================================
          //
          // SQLite = Banco de dados LOCAL
          // - Armazenado em um arquivo (.db)
          // - Não precisa de servidor
          // - Ótimo para: desenvolvimento, testes, projetos pequenos
          // - Vantagem: Fácil de configurar, portátil
          // - Desvantagem: Não escala para produção
          return {
            type: 'better-sqlite3', // Tipo: SQLite
            database: process.env.DB_DATABASE || './db.sqlite', // Arquivo do banco
            synchronize: process.env.DB_SYNCHRONIZE === '1', // Sincroniza schema?
            autoLoadEntities: process.env.DB_AUTO_LOAD_ENTITIES === '1', // Auto-carrega entidades?
          };
          //           ↑
          //           SQLITE = Banco em arquivo local
          //           Ótimo para começar o projeto!
        }

        // ==========================================
        // CONFIGURAÇÃO DO POSTGRESQL (PADRÃO)
        // ==========================================
        //
        // PostgreSQL = Banco de dados SERVIDOR
        // - Rodando em um servidor separado
        // - Requer: host, port, username, password
        // - Ótimo para: produção, grandes projetos, empresas
        // - Vantagem: Escalável, seguro, robusto
        // - Desvantagem: Requer configuração adicional
        return {
          type: 'postgres', // Tipo: PostgreSQL
          host: process.env.DB_HOST, // Servidor: localhost ou IP
          port: parseInt(process.env.DB_PORT || '5432', 10), // Porta: 5432 (padrão)
          username: process.env.DB_USERNAME, // Usuário: quem acessa
          password: process.env.DB_PASSWORD, // Senha: acesso ao banco
          synchronize: process.env.DB_SYNCHRONIZE === '1', // Sincroniza schema?
          autoLoadEntities: process.env.DB_AUTO_LOAD_ENTITIES === '1', // Auto-carrega entidades?
        };
        //           ↑
        //           POSTGRESQL = Banco em servidor remoto
        //           Ótimo para produção!
      },
    }),

    UploadModule,
  ],

  // ==========================================
  // CONTROLLERS - Controladores deste módulo
  // ==========================================

  controllers: [
    // AppController - CONTROLADOR PRINCIPAL
    // ─────────────────────────────────────
    // O que faz: Gerencia as rotas da RAIZ da aplicação
    //
    // Rotas disponíveis:
    // - GET / (raiz) - Status da aplicação
    // - GET /health - Health check (verificação de saúde)
    //
    // Por que está aqui? É o controller principal
    // Geralmente usado para: health checks, status, documentação
    //
    // Exemplo de resposta:
    // { "status": "ok", "message": "API is running!" }
  ],

  // ==========================================
  // PROVIDERS - Serviços deste módulo
  // ==========================================

  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

// ==========================================
// O QUE É O AppModule?
// ==========================================

// O AppModule é o MÓDULO RAIZ (principal) da aplicação
// É o PONTO DE ENTRADA - tudo começa aqui!

// ┌─────────────────────────────────────────────────────────────┐
// │                      AppModule                             │
// │                                                           │
// │  IMPORTS (Módulos que a aplicação usa)                   │
// │  ┌─────────────────────────────────────────────────────┐ │
// │  │ AuthModule   (Autenticação)                        │ │
// │  │ UserModule   (Usuários)                            │ │
// │  │ PostModule   (Posts)                              │ │
// │  │ ConfigModule (Variáveis de ambiente)              │ │
// │  │ TypeOrmModule (Banco de dados)                    │ │
// │  └─────────────────────────────────────────────────────┘ │
// │                                                           │
// │  CONTROLLERS (Rotas da raiz)                              │
// │  ┌─────────────────────────────────────────────────────┐ │
// │  │ AppController (GET /, GET /health)                 │ │
// │  └─────────────────────────────────────────────────────┘ │
// │                                                           │
// │  PROVIDERS (Serviços principais)                          │
// │  ┌─────────────────────────────────────────────────────┐ │
// │  │ AppService (Lógica de negócio geral)               │ │
// │  └─────────────────────────────────────────────────────┘ │
// └─────────────────────────────────────────────────────────────┘

// ==========================================
// O QUE CADA IMPORTAÇÃO FAZ?
// ==========================================

// 1. AuthModule: Adiciona autenticação
//    - Login, logout, tokens JWT

// 2. UserModule: Adiciona gerenciamento de usuários
//    - Criar, buscar, atualizar usuários

// 3. PostModule: Adiciona gerenciamento de posts
//    - Criar, listar, atualizar, deletar posts

// 4. ConfigModule: Carrega variáveis de ambiente
//    - Acesso a .env em toda aplicação

// 5. TypeOrmModule: Conecta ao banco de dados
//    - SQLite (desenvolvimento) ou PostgreSQL (produção)

// ==========================================
// FLUXO DE INICIALIZAÇÃO DA APLICAÇÃO
// ==========================================

// 1. NestJS lê o AppModule
//    └─→ Vê que é o módulo principal

// 2. Carrega o ConfigModule
//    └─→ Lê o arquivo .env
//    └─→ process.env está disponível

// 3. Carrega o TypeOrmModule
//    └─→ Executa o useFactory()
//    └─→ Lê process.env.DB_TYPE
//    └─→ Decide: SQLite ou PostgreSQL?
//    └─→ Conecta ao banco escolhido

// 4. Carrega os outros módulos
//    └─→ AuthModule (autenticação)
//    └─→ UserModule (usuários)
//    └─→ PostModule (posts)

// 5. Registra os controllers
//    └─→ AppController (rotas da raiz)

// 6. Registra os providers
//    └─→ AppService (lógica geral)

// 7. Aplicação está PRONTA!
//    └─→ Aguardando requisições em: http://localhost:3000

// ==========================================
// EXEMPLO DE .env COMPATÍVEL
// ==========================================

// #SQLite (desenvolvimento)
// DB_TYPE = better-sqlite3
// DB_DATABASE = ./db.sqlite
// DB_SYNCHRONIZE = 1
// DB_AUTO_LOAD_ENTITIES = 1

// #PostgreSQL (produção)
// DB_TYPE = postgres
// DB_HOST = localhost
// DB_PORT = 5432
// DB_USERNAME = meuuser
// DB_PASSWORD = senhasecreta
// DB_DATABASE = myapp
// DB_SYNCHRONIZE = 0
// DB_AUTO_LOAD_ENTITIES = 1

// #JWT
// JWT_SECRET = minha_chave_secreta_super_segura
// JWT_EXPIRATION = 7d

// #Servidor
// PORT = 3000

// ==========================================
// DIFERENÇA ENTRE forRoot() e forRootAsync()
// ==========================================

// ConfigModule.forRoot() - CONFIGURAÇÃO SIMPLES
// ──────────────────────────────────────────
// - Carrega o .env
// - Síncrono
// - isGlobal: true (disponível em toda aplicação)

// TypeOrmModule.forRootAsync() - CONFIGURAÇÃO DINÂMICA
// ──────────────────────────────────────────────────
// - Configura o banco de dados
// - Assíncrono (pode usar async/await)
// - useFactory: decide a configuração
// - Suporta múltiplos bancos

// ==========================================
// EXEMPLOS DE ROTAS DISPONÍVEIS
// ==========================================

// ROTAS PÚBLICAS (sem autenticação):
// ──────────────────────────────────
// GET / - Status da aplicação
// POST /auth/login - Login
// POST /user - Criar usuário

// ROTAS PROTEGIDAS (com token JWT):
// ─────────────────────────────────
// GET /user/me - Meu perfil
// GET /user/:id - Buscar usuário
// POST /post - Criar post
// GET /post - Listar posts
// GET /post/:id - Buscar post
// PATCH /post/:id - Atualizar post
// DELETE /post/:id - Deletar post

// ==========================================
// COMO ADICIONAR UM NOVO MÓDULO?
// ==========================================

// 1. Crie o módulo:
//    nest generate module product

// 2. Adicione ao AppModule:
//    imports: [
//      AuthModule,
//      UserModule,
//      PostModule,
//      ProductModule, // 👈 ADICIONAR AQUI!
//      ConfigModule.forRoot({ isGlobal: true }),
//      TypeOrmModule.forRootAsync({ ... }),
//    ],

// 3. O módulo está disponível!
//    Rotas: GET /product, POST /product, etc.

// ==========================================
// BOAS PRÁTICAS NO AppModule
// ==========================================

// 1. ✅ Mantenha o AppModule LIMPO e ORGANIZADO
// 2. ✅ Use forRoot() para configurações globais
// 3. ✅ Use forRootAsync() para configurações dinâmicas
// 4. ✅ Organize os imports por categoria
// 5. ✅ Comente os módulos para facilitar a manutenção
// 6. ✅ Use isGlobal: true para módulos que todos usam
// 7. ✅ Separe funcionalidades em módulos diferentes

// ==========================================
// ANALOGIA: AppModule como "DEPARTAMENTO PRINCIPAL"
// ==========================================

// AppModule = SEDE DA EMPRESA
// ──────────────────────────
// - ConfigModule = Departamento de RH (gerencia funcionários/variáveis)
// - TypeOrmModule = Departamento de TI (gerencia servidores/banco)
// - AuthModule = Departamento de Segurança (autenticação)
// - UserModule = Departamento de Clientes (usuários)
// - PostModule = Departamento de Marketing (posts)
// - AppController = Recepção da empresa (rotas principais)
// - AppService = Gerente Geral (lógica principal)

// ==========================================
// RESUMO EM PORTUGUÊS SIMPLES
// ==========================================

// O AppModule é o "CORPO" da aplicação:
// 1. IMPORTA todos os módulos que a aplicação precisa
// 2. CONFIGURA o banco de dados (SQLite ou PostgreSQL)
// 3. CARREGA as variáveis de ambiente (.env)
// 4. REGISTRA o controller principal (rotas /)
// 5. REGISTRA o serviço principal (lógica geral)

// Pense no AppModule como a "ENTRADA DA FÁBRICA":
// - Você conecta todas as máquinas (módulos)
// - Configura a energia (banco de dados)
// - Define as regras da fábrica (variáveis de ambiente)
// - Coloca os funcionários (controllers e services)
// - A fábrica (aplicação) está pronta para funcionar! 🏭
