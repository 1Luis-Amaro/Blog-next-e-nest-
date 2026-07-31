// ==========================================
// IMPORTAÇÕES - Trazendo funcionalidades de outros lugares
// ==========================================

import {
  Body, // Decorator que extrai os dados do corpo da requisição (JSON enviado pelo cliente)
  Controller, // Decorator que marca a classe como um controlador de rotas HTTP
  Delete, // Decorator que define uma rota que responde a requisições DELETE (remoção)
  Get, // Decorator que define uma rota que responde a requisições GET (busca)
  Param, // Decorator que extrai parâmetros da URL (ex: /user/123 pega o 123)
  Patch, // Decorator que define uma rota que responde a requisições PATCH (atualização parcial)
  Post, // Decorator que define uma rota que responde a requisições POST (criação)
  Req, // Decorator que injeta o objeto completo da requisição HTTP
  UseGuards, // Decorator que aplica um guarda (proteção) em uma rota específica
} from '@nestjs/common'; // Importa todas as ferramentas principais do NestJS

import { ConfigService } from '@nestjs/config'; // Serviço para acessar variáveis de ambiente do arquivo .env

import { CreateUserDto } from './dto/create-user.dto'; // DTO que define quais campos são necessários para CRIAR um usuário

import { UserService } from './user.service'; // Service que contém toda a lógica de negócio relacionada a usuários

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'; // Guard personalizado que verifica se o token JWT é válido

import type { AuthenticatedRequest } from 'src/auth/types/authenticated-request'; // Tipo que define uma requisição com usuário autenticado (contém req.user)

import { UpdateUserDto } from './dto/update-user.dto'; // DTO que define quais campos são necessários para ATUALIZAR um usuário
import { UserResponseDto } from './dto/user-response.dto'; // DTO que define como os dados do usuário são retornados na resposta (oculta senha, etc.)
import { UpdatePasswordDto } from './dto/update-password.dto'; // DTO que define quais campos são necessários para ATUALIZAR a senha

// ==========================================
// CONTROLADOR PRINCIPAL
// ==========================================

@Controller('user') // Define que todas as rotas deste controller começam com /user (ex: /user, /user/123, /user/me)
export class UserController {
  // Declara a classe do controlador de usuários
  constructor(
    private readonly configSerivce: ConfigService, // Injeta o serviço de configuração para ler .env (não está sendo usado ainda)
    private readonly userService: UserService, // Injeta o serviço de usuários para acessar os métodos de negócio
  ) {}

  // ==========================================
  // ROTAS FIXAS (SEM PARÂMETROS DINÂMICOS)
  // IMPORTANTE: Devem vir ANTES das rotas com :id para evitar conflitos
  // ==========================================

  @UseGuards(JwtAuthGuard) // Aplica o guard de autenticação - apenas usuários com token JWT válido podem acessar
  @Get('me') // Define que este método responde a GET na rota /user/me (busca o próprio perfil)
  async findOne(@Req() req: AuthenticatedRequest) {
    // Injeta a requisição com o usuário autenticado (req.user contém os dados do usuário logado)
    // Busca o usuário no banco pelo ID extraído do token JWT
    const user = await this.userService.findOneByOrFail({ id: req.user.id });
    // Retorna os dados do usuário formatados pelo DTO de resposta (oculta a senha)
    return new UserResponseDto(user);
  }

  @UseGuards(JwtAuthGuard) // Aplica o guard de autenticação - apenas usuários com token JWT válido podem acessar
  @Patch('me') // Define que este método responde a PATCH na rota /user/me (atualiza o próprio perfil)
  async update(
    @Req() req: AuthenticatedRequest, // Injeta a requisição com o usuário autenticado para pegar o ID do usuário logado
    @Body() dto: UpdateUserDto, // Extrai os dados do corpo da requisição e valida com o DTO (name, email)
  ) {
    // Chama o service para atualizar o usuário com o ID do logado e os dados enviados
    const user = await this.userService.update(req.user.id, dto);
    // Retorna os dados do usuário atualizados formatados pelo DTO de resposta
    return new UserResponseDto(user);
  }

  @UseGuards(JwtAuthGuard) // Aplica o guard de autenticação - apenas usuários com token JWT válido podem acessar
  @Patch('me/password') // Define que este método responde a PATCH na rota /user/me/password (altera a própria senha)
  async updatePassword(
    @Req() req: AuthenticatedRequest, // Injeta a requisição com o usuário autenticado para pegar o ID do usuário logado
    @Body() dto: UpdatePasswordDto, // Extrai os dados do corpo da requisição e valida com o DTO (currentPassword, newPassword)
  ) {
    // Chama o service para atualizar a senha com o ID do logado e os dados enviados
    const user = await this.userService.updatePassword(req.user.id, dto);
    // Retorna o DTO de resposta (oculta senha, forceLogout)
    return new UserResponseDto(user);
  }

  @UseGuards(JwtAuthGuard) // Aplica o guard de autenticação - apenas usuários com token JWT válido podem acessar
  @Delete('me') // Define que este método responde a DELETE na rota /user/me (remove a própria conta)
  async remove(@Req() req: AuthenticatedRequest) {
    // Injeta a requisição com o usuário autenticado (req.user contém os dados do usuário logado)
    // Chama o service para remover o usuário com o ID extraído do token JWT
    const user = await this.userService.remove(req.user.id);
    // Retorna os dados do usuário removido (útil para confirmar a operação)
    return new UserResponseDto(user);
  }

  // ==========================================
  // ROTAS PÚBLICAS (SEM AUTENTICAÇÃO)
  // ==========================================

  @Post() // Define que este método responde a POST na rota /user (pública - qualquer um pode criar conta)
  async create(@Body() dto: CreateUserDto) {
    // Extrai os dados do corpo da requisição e valida com o DTO (name, email, password)
    // Chama o service para criar o usuário e retorna o resultado
    const user = await this.userService.create(dto);
    // Retorna os dados do usuário criado formatados pelo DTO de resposta
    return new UserResponseDto(user);
  }

  // ==========================================
  // ROTA DINÂMICA (COM PARÂMETRO :id)
  // IMPORTANTE: Deve vir DEPOIS das rotas fixas para não conflitar com /me
  // ==========================================

  // @Get(':id') // Descomente se precisar buscar usuário por ID (ex: /user/123)
  // async findById(@Param('id') id: string) {
  //   // Busca o usuário no banco pelo ID fornecido na URL
  //   const user = await this.userService.findOneByOrFail({ id });
  //   // Retorna os dados do usuário encontrado
  //   return new UserResponseDto(user);
  // }
}
