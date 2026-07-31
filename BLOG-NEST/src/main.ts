import { NestFactory } from '@nestjs/core';
// Importa a classe NestFactory que cria a aplicação NestJS
// Ela é responsável por inicializar o servidor

import { AppModule } from './app.module';
// Importa o módulo principal da aplicação (AppModule)
// AppModule contém todas as configurações, controllers, services, etc.

import { ValidationPipe } from '@nestjs/common';
// Importa o ValidationPipe que valida automaticamente os DTOs
// Ele verifica se os dados recebidos estão corretos (usando class-validator)

import 'dotenv/config';
// Importa e configura o dotenv para carregar variáveis de ambiente do arquivo .env
// Permite usar process.env.VARIAVEL em qualquer lugar

import helmet from 'helmet';
// Importa o Helmet: um middleware de segurança para Express
// Ele adiciona cabeçalhos HTTP para proteger a aplicação contra vulnerabilidades conhecidas

import { parseCorsWhitelist } from './common/utils/parse-cors-whitelist';
// Importa uma função que converte uma string de URLs em um array
// Exemplo: "http://localhost:3000,https://meusite.com" → ['http://localhost:3000', 'https://meusite.com']

// ==========================================

async function bootstrap() {
  // Função assíncrona que inicia a aplicação
  // bootstrap = "inicializar" - é o ponto de partida da aplicação

  const app = await NestFactory.create(AppModule);
  // Cria uma instância da aplicação NestJS
  // AppModule: módulo principal que contém todas as configurações
  // await: espera a criação ser concluída
  // app: objeto que representa a aplicação (serve para configurar rotas, middlewares, etc.)

  // ==========================================

  app.use(
    // Aplica um middleware global
    helmet({
      // Helmet: segurança para cabeçalhos HTTP
      crossOriginResourcePolicy: { policy: 'cross-origin' }, // Permite recursos de outras origens
    }), // Fecha helmet
  ); // Fecha app.use

  const corsWhiteList = parseCorsWhitelist(process.env.CORS_WHITELIST ?? ''); // Converte .env em array de URLs

  app.enableCors({
    // Habilita CORS
    origin: (
      // Função que valida a origem
      origin: string | undefined, // aqui falo que na requisição pode vir um parametro chamado origin que vai ser uma string ou undefined
      callback: (...args: any[]) => void, // aqui estou falando que essa função vai receber outra função, que pode receber varios argumentos e desses varios argumentos pode ser qualquer coisa por isso o any e por fim me retorna vazio
    ) => {
      // Início da validação
      if (!origin || corsWhiteList.includes(origin)) {
        // Se o parametro origin não veio da requisição ou se tiver origin la no meu arquivo .env
        return callback(null, true); // minha callback recebe (null, true) onde o null significa que não teve erro e o true é pra falar que pode passar
      } // Fecha o if
      return callback(new Error('Not allowed by CORS'), false); // já se a origin veio na requisição e não estiver disponivel no .env vou bloquear o acesso com um erro
    }, // Fecha a função origin
  }); // Fecha o app.enableCors

  // ==========================================

  app.useGlobalPipes(
    // Adiciona pipes globais que serão aplicados em TODAS as requisições
    // Pipes são responsáveis por transformar e validar dados

    new ValidationPipe({
      // Cria uma nova instância do ValidationPipe
      // Ele valida automaticamente os DTOs usando class-validator

      whitelist: true,
      // whitelist: true → remove automaticamente propriedades que NÃO estão no DTO
      // Exemplo: Se o DTO tem title e content, mas o body enviou title, content e extra
      // A propriedade 'extra' será removida automaticamente (ignorada)

      forbidNonWhitelisted: true,
      // forbidNonWhitelisted: true → se o body enviar uma propriedade que NÃO está no DTO
      // Em vez de só remover, LANÇA UM ERRO 400 (Bad Request)
      // Exemplo: Se o DTO tem title e content, e o body enviou title, content e extra
      // → Retorna erro 400: "Property extra should not exist"
    }),
  );

  // ==========================================

  await app.listen(process.env.PORT ?? 3001);
  // Inicia o servidor HTTP e começa a ouvir requisições
  // process.env.PORT: variável de ambiente com a porta (ex: 3000, 8080)
  // ?? 3001: se não tiver variável PORT, usa a porta 3001 (fallback)
  // await: espera o servidor iniciar
  // A aplicação agora está rodando e aceitando requisições
}

// ==========================================

void bootstrap();
// Chama a função bootstrap para iniciar a aplicação
// void: ignora qualquer retorno da função (não usamos o retorno)
// Isso inicia toda a aplicação
