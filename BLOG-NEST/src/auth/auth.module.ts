// ==========================================
// IMPORTAÇÕES - Trazendo funcionalidades
// ==========================================

// Importa decorators e exceções do NestJS
// - InternalServerErrorException: Erro 500 - erro interno do servidor
// - Module: Define que esta classe é um módulo do NestJS
import { InternalServerErrorException, Module } from '@nestjs/common';

// Importa o AuthController (controlador de autenticação)
// Gerencia as rotas de autenticação: /auth/login, /auth/logout, etc.
import { AuthController } from './auth.controller';

// Importa o AuthService (serviço de autenticação)
// Contém a lógica de negócio: login, logout, validação de tokens, etc.
import { AuthService } from './auth.service';

// Importa o UserModule (módulo de usuários)
// Para usar o UserService (buscar usuários no banco)
import { UserModule } from 'src/user/user.module';

// Importa o CommonModule (módulo de funcionalidades comuns)
// Para usar o HashingService (criptografar senhas)
import { CommonModule } from 'src/common/common.module';

// Importa o JwtModule do NestJS para gerar e validar tokens JWT
import { JwtModule } from '@nestjs/jwt';

// Importa o JwtStrategy (estratégia de validação do JWT)
// Define como o Passport vai validar os tokens
import { JwtStrategy } from './jwt.strategy';

// ==========================================
// DECLARAÇÃO DO MÓDULO - AuthModule
// ==========================================

@Module({
  // ==========================================
  // IMPORTS - Módulos que este módulo PRECISA
  // ==========================================
  imports: [
    // UserModule - Para usar o UserService
    // O AuthService precisa buscar usuários por email e ID
    UserModule,

    // CommonModule - Para usar o HashingService
    // O AuthService precisa comparar senhas
    CommonModule,

    // JwtModule.registerAsync - Configuração do JWT
    // registerAsync = Configuração assíncrona e dinâmica
    // useFactory = Função que PRODUZ a configuração
    JwtModule.registerAsync({
      // useFactory - Fábrica que cria a configuração do JWT
      // Decide a configuração baseado nas variáveis de ambiente (.env)
      useFactory: () => {
        // ==========================================
        // 1. LÊ O SECRET DO ARQUIVO .ENV
        // ==========================================

        // process.env.JWT_SECRET = chave secreta para assinar os tokens
        // Vem do arquivo .env: JWT_SECRET=minha_chave_secreta
        const secret = process.env.JWT_SECRET;

        // ==========================================
        // 2. VALIDA SE O SECRET EXISTE
        // ==========================================

        // Se o secret NÃO existe no .env:
        if (!secret) {
          // Lança erro 500 (Internal Server Error)
          // A aplicação NÃO DEVE iniciar sem o JWT_SECRET
          // Isso é uma medida de segurança!
          throw new InternalServerErrorException(
            'JWT_SECRET not found in .env',
          );
        }

        // ==========================================
        // 3. RETORNA A CONFIGURAÇÃO DO JWT
        // ==========================================

        return {
          secret, // Chave secreta (do .env)
          signOptions: {
            // expiresIn = Tempo de expiração do token
            // Pode ser: '1d' (1 dia), '7d' (7 dias), '1h' (1 hora), etc.
            // Vem do .env: JWT_EXPIRATION=7d
            // Se não existir, usa '1d' (1 dia) como padrão
            expiresIn: (process.env.JWT_EXPIRATION || '1d') as any,
          },
        };
      },
    }),
  ],

  // ==========================================
  // CONTROLLERS - Controladores deste módulo
  // ==========================================
  controllers: [
    // AuthController - Controlador de autenticação
    // Rotas: POST /auth/login, POST /auth/logout, etc.
    AuthController,
  ],

  // ==========================================
  // PROVIDERS - Serviços deste módulo
  // ==========================================
  providers: [
    // AuthService - Serviço de autenticação
    // Contém a lógica de login, logout, etc.
    AuthService,

    // JwtStrategy - Estratégia de validação do JWT
    // Usada pelo Passport para validar tokens
    // Define como extrair o token e como validar
    JwtStrategy,
  ],

  // ==========================================
  // EXPORTS - O que este módulo COMPARTILHA
  // ==========================================
  exports: [], // Este módulo não exporta nada (é privado)
})
export class AuthModule {}
