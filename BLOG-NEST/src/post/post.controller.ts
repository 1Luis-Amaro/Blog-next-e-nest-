import {
  Body, // Decorator que extrai os dados do corpo da requisição (JSON enviado pelo cliente)
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch, // Decorator que marca a classe como um controlador de rotas HTTP
  Post, // Decorator que define uma rota que responde a requisições POST (criação)
  Req, // Decorator que injeta o objeto completo da requisição HTTP
  UseGuards, // Decorator que aplica um guarda (proteção) em uma rota específica
} from '@nestjs/common'; // Importa todas as ferramentas principais do NestJS

import { PostService } from './post.service'; // Importa o service que contém a lógica de negócio para posts

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'; // Importa o guard de autenticação JWT para proteger as rotas

import { CreatePostDto } from './dto/create-post.dto'; // Importa o DTO que define quais campos são necessários para CRIAR um post

import { PostResponseDto } from './dto/post-response.dto'; // Importa o DTO que define como os dados do post são retornados na resposta

import type { AuthenticatedRequest } from 'src/auth/types/authenticated-request'; // Importa o tipo que define uma requisição com usuário autenticado (contém req.user)
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('post') // Define que todas as rotas deste controller começam com /post (ex: /post, /post/me)
export class PostController {
  // Declara a classe do controlador de posts
  constructor(private readonly postService: PostService) {} // Injeta o service de posts no controller (injeção de dependência)

  @UseGuards(JwtAuthGuard) // Aplica o guard de autenticação - apenas usuários com token JWT válido podem acessar
  @Post('me') // Define que este método responde a POST na rota /post/me (cria um post para o usuário logado)
  async create(
    // Método assíncrono que cria um novo post
    @Req() req: AuthenticatedRequest, // Injeta a requisição com o usuário autenticado (req.user contém os dados do usuário logado)
    @Body() dto: CreatePostDto, // Extrai os dados do corpo da requisição e valida com o DTO (title, excerpt, content, coverImageUrl)
  ) {
    const post = await this.postService.create(dto, req.user); // Chama o service para criar o post associado ao usuário logado
    return new PostResponseDto(post); // Retorna os dados do post criado formatados pelo DTO de resposta (oculta dados sensíveis)
  }

  @UseGuards(JwtAuthGuard) // Aplica o guard de autenticação - apenas usuários com token JWT válido podem acessar
  @Get('me/:id') // Define que este método responde a POST na rota /post/me/id - pegar um post do usuário logado pelo id
  async findOneOwned(
    //crio a mesma função que busca um unico post do usuário autenticado la do service
    // Método assíncrono que busca somente um post
    @Req() req: AuthenticatedRequest, // Injeta a requisição com o usuário autenticado (req.user contém os dados do usuário logado)
    @Param('id', ParseUUIDPipe) id: string, // Extrai o parâmetro 'id' da URL e valida se é um UUID válido (ex: /post/me/550e8400-e29b-41d4-a716-446655440000)
  ) {
    const post = await this.postService.findOneOwnedOrFail({ id }, req.user); // Chama a minha função la do service que nela contem toda a função do findOneOwned só que adicionamos a mensagem caso não ter post
    return new PostResponseDto(post); //  Se o post foi encontrado, formata os dados com o DTO de resposta (oculta dados sensíveis)
  }

  @UseGuards(JwtAuthGuard) // Aplica o guard de autenticação - apenas usuários com token JWT válido podem acessar
  @Get('me') // Define que este método responde a Get na rota /post/me - pega todos os posts do usuário logado
  async findAllOwned(
    // Método assíncrono que busca todos os posts
    @Req() req: AuthenticatedRequest, // Injeta a requisição com o usuário autenticado (req.user contém os dados do usuário logado)
  ) {
    const posts = await this.postService.findAllOwned(req.user); // Chama o service para buscar todos os posts do usuário autenticado, no req.user tenho todas as informações do usuário autenticado (extraídos do token JWT), e la no meu service vou usar o author.id que veio do req.user, ai dessa forma no where filtro  apenas os posts do autor
    return posts.map(post => new PostResponseDto(post)); // ai aqui faço um map porque preciso pegar vários posts então faço uma lista de post, e com a lista que gerou o DTO de resposta oculta dados sensíveis (como senha, etc.) que definimos no DTO e Retorna um array de posts formatados para o cliente
  }

  @UseGuards(JwtAuthGuard) // Aplica o guard de autenticação - apenas usuários com token JWT válido podem acessar
  @Patch('me/:id') // Define que este método responde a Patch que atualiza alguns dados, os que eu escolher, na rota /post/me/id da pessoa Atualiza UM post específico do usuário logado (identificado pelo :id)
  async update(
    // Método assíncrono que atualiza um novo post
    @Param('id', ParseUUIDPipe) id: string, // Extrai o parâmetro 'id' da URL e valida se é um UUID válido (ex: /post/me/550e8400-e29b-41d4-a716-446655440000)
    @Req() req: AuthenticatedRequest, // Injeta a requisição com o usuário autenticado (req.user contém os dados do usuário logado)
    @Body() dto: UpdatePostDto, // Extrai os dados do corpo da requisição e valida com o DTO de atualização (title, excerpt, content, coverImageUrl) (todos opcionais)
  ) {
    const post = await this.postService.update({ id }, dto, req.user); // Chama o service para atualizar os dados do post, passo o id (filtro), dto (dados para atualizar) e req.user (para verificar permissão)
    return new PostResponseDto(post); // Retorna os dados do atualziado formatados pelo DTO de resposta (oculta dados sensíveis)
  }

  @UseGuards(JwtAuthGuard) // Aplica o guard de autenticação - apenas usuários com token JWT válido podem acessar
  @Delete('me/:id') // Define que este método responde a Patch que atualiza alguns dados, os que eu escolher, na rota /post/me/id da pessoa Atualiza UM post específico do usuário logado (identificado pelo :id)
  async remove(
    // Método assíncrono que atualiza um novo post
    @Param('id', ParseUUIDPipe) id: string, // Extrai o parâmetro 'id' da URL e valida se é um UUID válido (ex: /post/me/550e8400-e29b-41d4-a716-446655440000)
    @Req() req: AuthenticatedRequest, // Injeta a requisição com o usuário autenticado (req.user contém os dados do usuário logado)
  ) {
    const post = await this.postService.remove({ id }, req.user); // Chama o service para atualizar os dados do post, passo o id (filtro), dto (dados para atualizar) e req.user (para verificar permissão)
    return new PostResponseDto(post); // Retorna os dados do atualziado formatados pelo DTO de resposta (oculta dados sensíveis)
  }

  @Get(':slug') //  Define que este método responde a GET na rota /post/:slug - busca UM post público pelo slug
  async findOnePublish(
    // Método assíncrono que busca um post publico
    @Param('slug') slug: string, // Extrai o parâmetro 'slug' da URL (ex: /post/meu-primeiro-post), o spred operator ... , vai pegar essa informação e jogar la no meu postData para fazer o filtro em cima disso
  ) {
    const post = await this.postService.findOneOrFail({
      slug,
      published: true,
    }); //Chama o service para buscar UM post que tenha o slug E esteja publicado
    return new PostResponseDto(post); //  Se o post foi encontrado, formata os dados com o DTO de resposta (oculta dados sensíveis)
  }

  @Get() // Define que este método responde a GET na rota /post - busca TODOS os posts publicados (rota pública)
  async findAllPublish() {
    // Método assíncrono que busca todos os posts
    const posts = await this.postService.findAll({ published: true }); //Chama o service para buscar TODOS os posts com published = true
    return posts.map(post => new PostResponseDto(post)); // ai aqui faço um map porque preciso pegar vários posts então faço uma lista de post, e com a lista que gerou o DTO de resposta oculta dados sensíveis (como senha, etc.) que definimos no DTO e Retorna um array de posts formatados para o cliente
  }
}
