// ==========================================
// IMPORTAÇÕES - Trazendo funcionalidades
// ==========================================

// Importa o decorator Module do NestJS
// @Module() - Define que esta classe é um módulo do NestJS
// Módulo = agrupamento de funcionalidades relacionadas
// É como uma "gaveta" que organiza controllers, services, etc.
import { Module } from '@nestjs/common';

// Importa o UserService (lógica de negócio dos usuários)
// Service = contém os métodos para criar, buscar, atualizar usuários
// Será registrado como provider (provedor de serviços)
import { UserService } from './user.service';

// Importa o UserController (rotas HTTP dos usuários)
// Controller = gerencia as requisições HTTP para /user
// Será registrado como controller (controlador de rotas)
import { UserController } from './user.controller';

// Importa o TypeOrmModule para integração com banco de dados
// TypeOrmModule = módulo do NestJS para usar TypeORM
// forFeature() = registra entidades para uso neste módulo
import { TypeOrmModule } from '@nestjs/typeorm';

// Importa a entidade User (estrutura da tabela 'users')
// User = classe que representa a tabela no banco de dados
// Define os campos: id, name, email, password, forceLogout, etc.
import { User } from './entities/user.entity';

// Importa o CommonModule (módulo de funcionalidades comuns)
// CommonModule contém: HashingService, pipes, interceptors, etc.
// É compartilhado entre vários módulos da aplicação
import { CommonModule } from 'src/common/common.module';

// ==========================================
// DECLARAÇÃO DO MÓDULO - UserModule
// ==========================================

// @Module() - Decorator que define a configuração do módulo
// O NestJS usa esta informação para organizar a aplicação
//
// Um módulo no NestJS é como um "departamento" da empresa:
// - UserModule = Departamento de Usuários
//   - Gerencia tudo sobre usuários
//   - Tem seus próprios funcionários (providers)
//   - Tem suas próprias salas (controllers)
//   - Pode usar outros departamentos (imports)
//   - Pode compartilhar recursos (exports)
@Module({
  // ==========================================
  // IMPORTS - Módulos que este módulo PRECISA
  // ==========================================

  imports: [
    // TypeOrmModule.forFeature([User]) - REGISTRA A ENTIDADE USER
    // ─────────────────────────────────────────────────────────────
    // O que faz: Diz ao TypeORM que este módulo usa a entidade User
    //
    // forFeature() = "Para esta funcionalidade" (User)
    // Registra o repositório do User para ser injetado
    //
    // Sem isso, o UserService não conseguiria usar:
    // @InjectRepository(User) private userRepository: Repository<User>
    //
    // ⚠️ IMPORTANTE: Só funciona se o TypeOrmModule já foi configurado
    // no módulo principal (AppModule) com forRoot()
    //
    // Exemplo: O UserService pode usar:
    // this.userRepository.find() - Buscar usuários
    // this.userRepository.save() - Salvar usuário
    // this.userRepository.delete() - Deletar usuário
    TypeOrmModule.forFeature([User]),

    // CommonModule - MÓDULO DE FUNCIONALIDADES COMUNS
    // ──────────────────────────────────────────────
    // O que faz: Traz funcionalidades compartilhadas
    //
    // O CommonModule contém:
    // - HashingService (para criptografar senhas)
    // - Pipes (para validar dados)
    // - Interceptors (para interceptar requisições)
    // - Guards (para proteger rotas)
    //
    // Por que importar? Porque o UserService precisa do HashingService!
    //
    // UserService usa:
    // constructor(private readonly hashingService: HashingService)
    //
    // Se não importarmos o CommonModule, o HashingService não estará
    // disponível para injeção no UserService!
    CommonModule,
  ],

  // ==========================================
  // PROVIDERS - Serviços deste módulo
  // ==========================================

  providers: [
    // UserService - SERVIÇO DE USUÁRIOS
    // ───────────────────────────────────
    // O que faz: Registra o UserService como um provider
    //
    // Provider = "Provedor de serviço"
    // É uma classe que pode ser INJETADA em outros lugares
    //
    // Quando registramos um provider, o NestJS:
    // 1. Cria uma instância do UserService
    // 2. Gerencia seu ciclo de vida (singleton por padrão)
    // 3. Permite que seja injetado em outros lugares
    //
    // O UserService contém:
    // - create(): Cria usuário
    // - findByEmail(): Busca por email
    // - findById(): Busca por ID
    // - save(): Salva usuário
    //
    // Quem pode usar o UserService?
    // - UserController (pode injetar UserService)
    // - AuthService (pode injetar UserService)
    // - Outros módulos que importarem o UserModule
    UserService,
  ],

  // ==========================================
  // CONTROLLERS - Controladores deste módulo
  // ==========================================

  controllers: [
    // UserController - CONTROLADOR DE USUÁRIOS
    // ────────────────────────────────────────
    // O que faz: Registra o UserController
    //
    // Controller = "Controlador de rotas HTTP"
    // Define os endpoints da API para /user
    //
    // O UserController contém:
    // - POST /user - Criar usuário (público)
    // - GET /user/:id - Buscar usuário (protegido)
    // - GET /user/me - Buscar próprio perfil (protegido)
    //
    // O NestJS vai:
    // 1. Criar uma instância do UserController
    // 2. Registrar as rotas automaticamente
    // 3. Rotear as requisições para os métodos corretos
    // 4. Aplicar os decorators (@Get, @Post, etc.)
    UserController,
  ],

  // ==========================================
  // EXPORTS - O que este módulo COMPARTILHA
  // ==========================================

  exports: [
    // UserService - COMPARTILHA O SERVIÇO
    // ────────────────────────────────────
    // O que faz: Permite que OUTROS módulos usem o UserService
    //
    // Se um módulo NÃO exporta algo, ele é PRIVADO
    // Só pode ser usado dentro do próprio módulo
    //
    // Exportar o UserService permite que:
    // - AuthModule use UserService para buscar usuários
    // - PostModule use UserService para validar autores
    // - Qualquer módulo que importar UserModule use UserService
    //
    // Exemplo no AuthModule:
    // imports: [UserModule] // Importa o módulo
    // constructor(private readonly userService: UserService) // ✅ PODE USAR!
    //
    // Por que exportar?
    // 1. AuthService precisa buscar usuários (findByEmail)
    // 2. JwtStrategy precisa buscar usuários (findById)
    // 3. Outros serviços podem precisar validar usuários
    //
    // Sem export, o UserService seria PRIVADO e inacessível!
    UserService,
  ],
})
export class UserModule {}

// ==========================================
// O QUE É UM MÓDULO NO NESTJS?
// ==========================================

// Um módulo é como um "departamento" da sua aplicação:

// ┌─────────────────────────────────────────────────┐
// │              USER MODULE (Departamento)         │
// │                                                 │
// │  IMPORTS (O que eu preciso de outros)          │
// │  ┌─────────────────────────────────────────┐   │
// │  │ TypeOrmModule.forFeature([User])       │   │
// │  │ CommonModule                           │   │
// │  └─────────────────────────────────────────┘   │
// │                                                 │
// │  CONTROLLERS (O que eu respondo)                │
// │  ┌─────────────────────────────────────────┐   │
// │  │ UserController                          │   │
// │  │  - POST /user                          │   │
// │  │  - GET /user/:id                      │   │
// │  └─────────────────────────────────────────┘   │
// │                                                 │
// │  PROVIDERS (Quem faz o trabalho)                │
// │  ┌─────────────────────────────────────────┐   │
// │  │ UserService                             │   │
// │  │  - create()                            │   │
// │  │  - findByEmail()                       │   │
// │  │  - findById()                          │   │
// │  │  - save()                              │   │
// │  └─────────────────────────────────────────┘   │
// │                                                 │
// │  EXPORTS (O que eu compartilho)                 │
// │  ┌─────────────────────────────────────────┐   │
// │  │ UserService (para outros módulos)       │   │
// │  └─────────────────────────────────────────┘   │
// └─────────────────────────────────────────────────┘

// ==========================================
// POR QUE ORGANIZAR EM MÓDULOS?
// ==========================================

// 1. ORGANIZAÇÃO: Cada módulo tem uma responsabilidade
//    - UserModule: Usuários
//    - AuthModule: Autenticação
//    - PostModule: Posts
//    - ProductModule: Produtos

// 2. REUSO: Podemos importar módulos em outros lugares
//    - AuthModule importa UserModule para usar UserService

// 3. ENCAPSULAMENTO: O que não é exportado fica privado
//    - O UserRepository é privado (só UserService usa)

// 4. DEPENDÊNCIAS: Gerencia o que cada módulo precisa
//    - UserModule precisa do TypeORM e CommonModule

// 5. TESTES: Fácil de testar módulos isoladamente

// ==========================================
// DIAGRAMA DE DEPENDÊNCIAS
// ==========================================

// AppModule (Principal)
// ├── UserModule
// │   ├── TypeOrmModule.forFeature([User])
// │   ├── CommonModule (HashingService)
// │   ├── UserService
// │   ├── UserController
// │   └── exports: UserService
// │
// ├── AuthModule
// │   ├── UserModule (para usar UserService)
// │   ├── JwtModule
// │   ├── AuthService
// │   ├── AuthController
// │   └── JwtStrategy
// │
// └── PostModule
//     ├── UserModule (para validar autores)
//     ├── PostService
//     └── PostController

// ==========================================
// O QUE ACONTECE QUANDO A APLICAÇÃO INICIA?
// ==========================================

// 1. NestJS lê o AppModule
// 2. AppModule importa UserModule
// 3. UserModule registra:
//    - UserController (rotas /user)
//    - UserService (lógica de negócio)
//    - UserRepository (banco de dados)
//    - HashingService (do CommonModule)
// 4. NestJS injeta dependências:
//    - UserController → UserService
//    - UserService → UserRepository + HashingService
// 5. Aplicação está pronta para receber requisições

// ==========================================
// EXEMPLO DE COMO USAR O UserModule EM OUTRO MÓDULO
// ==========================================

// AuthModule:
// ───────────
// @Module({
//   imports: [
//     UserModule, // ✅ Importa para usar UserService
//     JwtModule,
//   ],
//   providers: [AuthService, JwtStrategy],
//   controllers: [AuthController],
// })
// export class AuthModule {}

// AuthService:
// ────────────
// @Injectable()
// export class AuthService {
//   constructor(
//     private readonly userService: UserService, // ✅ PODE INJETAR!
//   ) {}
//
//   async login(loginDto: LoginDto) {
//     const user = await this.userService.findByEmail(loginDto.email);
//     // ...
//   }
// }

// ==========================================
// DIFERENÇA ENTRE forRoot() e forFeature()
// ==========================================

// TypeOrmModule.forRoot() - CONFIGURAÇÃO GLOBAL
// ─────────────────────────────────────────────
// - Usado UMA VEZ no AppModule
// - Configura a conexão com o banco
// - Define: host, port, user, password, database
// - É global (toda aplicação usa a mesma conexão)

// TypeOrmModule.forFeature([User]) - REGISTRO LOCAL
// ──────────────────────────────────────────────────
// - Usado em CADA módulo que precisa
// - Registra as entidades que o módulo usa
// - Permite usar @InjectRepository(Entity)
// - Só funciona se o forRoot() já foi configurado

// Exemplo:
// AppModule: TypeOrmModule.forRoot({...}) // Configuração
// UserModule: TypeOrmModule.forFeature([User]) // Registro
// PostModule: TypeOrmModule.forFeature([Post]) // Registro

// ==========================================
// RESUMO EM PORTUGUÊS SIMPLES
// ==========================================

// O UserModule é como um "departamento de usuários":
//
// 1. IMPORTS: O que o departamento precisa
//    - TypeORM (para acessar o banco)
//    - CommonModule (para usar o HashingService)
//
// 2. PROVIDERS: Os funcionários do departamento
//    - UserService (o funcionário que faz as tarefas)
//
// 3. CONTROLLERS: O que o departamento atende
//    - UserController (as rotas que o departamento responde)
//
// 4. EXPORTS: O que o departamento compartilha
//    - UserService (outros departamentos podem usar)

// 💡 REGRA DE OURO:
// - Se outros módulos precisam usar, EXPORTE!
// - Se é privado do módulo, NÃO exporte!
// - Se precisa de outro módulo, IMPORTE!

// ==========================================
// BOAS PRÁTICAS USADAS AQUI:
// ==========================================

// 1. ✅ Organização por funcionalidade (UserModule)
// 2. ✅ Injeção de dependências (DI)
// 3. ✅ Separação de responsabilidades
// 4. ✅ Reuso de módulos (CommonModule)
// 5. ✅ Exportação do que é necessário (UserService)
// 6. ✅ Uso correto do TypeORM (forFeature)
// 7. ✅ Encapsulamento (só exporta o necessário)
