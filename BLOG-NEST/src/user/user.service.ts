// ==========================================
// IMPORTAÇÕES - Trazendo funcionalidades
// ==========================================

import {
  BadRequestException, // Exceção para requisições inválidas (400)
  ConflictException, // Exceção para conflitos (409) - ex: email já existe
  Injectable, // Decorator que marca a classe como injetável
  NotFoundException, // Exceção para recurso não encontrado (404)
  UnauthorizedException, // Exceção para não autorizado (401) - ex: senha incorreta
} from '@nestjs/common'; // Importa decorators e exceções (erros) do NestJS

import { Repository } from 'typeorm'; // Importa o Repository do TypeORM para operações no banco de dados

import { User } from './entities/user.entity'; // Importa a entidade User (representa a tabela 'users' no banco)

import { InjectRepository } from '@nestjs/typeorm'; // Importa o decorador que injeta o repositório no service

import { CreateUserDto } from './dto/create-user.dto'; // Importa o DTO para CRIAR usuário (name, email, password)

import { HashingService } from 'src/common/hashing/hashing.service'; // Importa o serviço de criptografia para hashear senhas

import { UpdateUserDto } from './dto/update-user.dto'; // Importa o DTO para ATUALIZAR usuário (name, email)
import { UpdatePasswordDto } from './dto/update-password.dto'; // Importa o DTO para ATUALIZAR senha (currentPassword, newPassword)

@Injectable() // Marca a classe como um serviço que pode ser injetado em outros lugares (controllers, outros services)
export class UserService {
  // Declara a classe do serviço de usuários
  constructor(
    @InjectRepository(User) // Decorador que injeta o repositório do User para operações no banco
    private readonly userRepository: Repository<User>, // Repositório que permite fazer operações CRUD no banco (save, find, delete, etc.)
    private readonly hashingService: HashingService, // Serviço que fornece métodos para criptografar (hash) e verificar senhas
  ) {}

  // ==========================================
  // MÉTODOS AUXILIARES (PRIVADOS/INTERNOS)
  // ==========================================

  async failIfEmailExists(email: string) {
    // Método auxiliar que verifica se um email já está cadastrado
    const exists = await this.userRepository.existsBy({
      // Verifica no banco se existe algum usuário com este email
      email, // Email a ser verificado
    });

    if (exists) {
      // Se o email já existe no banco
      throw new ConflictException('E-mail já existe'); // Lança erro 409 (Conflito) - email já está em uso
    }
  }

  async findOneByOrFail(userData: Partial<User>) {
    // Método auxiliar que busca um usuário ou lança erro se não encontrar
    const user = await this.userRepository.findOneBy(userData); // Tenta encontrar um usuário que corresponda aos critérios
    if (!user) {
      // Se não encontrou nenhum usuário
      throw new NotFoundException('Usuário não encontrado'); // Lança erro 404 (Não encontrado)
    }
    return user; // Retorna o usuário encontrado
  }

  // ==========================================
  // MÉTODOS DE BUSCA (READ)
  // ==========================================

  findByEmail(email: string) {
    // Método para buscar um usuário pelo email (usado no login)
    return this.userRepository.findOneBy({ email }); // Busca no banco um usuário com o email fornecido
  }

  findById(id: string) {
    // Método para buscar um usuário pelo ID (usado na validação do JWT)
    return this.userRepository.findOneBy({ id }); // Busca no banco um usuário com o ID fornecido
  }

  // ==========================================
  // MÉTODOS DE CRIAÇÃO (CREATE)
  // ==========================================

  async create(dto: CreateUserDto) {
    // Método principal para CRIAR um novo usuário
    await this.failIfEmailExists(dto.email); // Primeiro verifica se o email já existe (chama o método auxiliar)

    const hashedPassword = await this.hashingService.hash(dto.password); // Criptografa a senha recebida (nunca salvar em texto puro!)

    const newUser: CreateUserDto = {
      // Cria um objeto com os dados do novo usuário
      name: dto.name, // Nome vindo do DTO
      email: dto.email, // Email vindo do DTO
      password: hashedPassword, // Senha já criptografada (NÃO usar dto.password direto!)
    };

    const created = await this.userRepository.save(newUser); // Salva o novo usuário no banco de dados
    return created; // Retorna o usuário criado com o ID gerado e timestamps
  }

  // ==========================================
  // MÉTODOS DE ATUALIZAÇÃO (UPDATE)
  // ==========================================

  async update(id: string, dto: UpdateUserDto) {
    // Método principal para ATUALIZAR um usuário
    if (!dto.name && !dto.email) {
      // Verifica se pelo menos um campo foi enviado para atualizar
      throw new BadRequestException('Dados não enviados'); // Se não enviou nada, lança erro 400 (Bad Request)
    }

    const user = await this.findOneByOrFail({ id }); // Busca o usuário pelo ID ou lança erro 404 se não existir

    user.name = dto.name ?? user.name;
    //  ↑          ↑
    //  |          └── Se o da esquerda for null/undefined, usa este
    //  └── Verifica se este valor existe

    if (dto.email && dto.email !== user.email) {
      // Se foi enviado um email e ele é diferente do atual
      await this.failIfEmailExists(dto.email); // Verifica se o novo email já está em uso por outro usuário
      user.email = dto.email; // Atualiza o email do usuário
      user.forceLogout = true; // Força logout para invalidar o token antigo (segurança)
    }

    return this.save(user); // Salva as alterações no banco e retorna o usuário atualizado
  }

  async updatePassword(id: string, dto: UpdatePasswordDto) {
    // Método para ATUALIZAR a senha do usuário
    const user = await this.findOneByOrFail({ id }); // Busca o usuário pelo ID ou lança erro 404 se não existir

    const isCurrentPasswordValid = await this.hashingService.compare(
      dto.currentPassword, // Senha atual fornecida pelo usuário
      user.password, // Senha armazenada no banco (hash)
    );
    // O método compare compara a senha em texto puro com o hash armazenado

    if (!isCurrentPasswordValid) {
      // Se a senha atual não for válida
      throw new UnauthorizedException('Senha atual inválida'); // Lança erro 401 (Não autorizado)
    }

    user.password = await this.hashingService.hash(dto.newPassword); // Hash da nova senha
    user.forceLogout = true; // Força logout para invalidar o token antigo (segurança)

    return this.save(user); // Salva as alterações no banco e retorna o usuário atualizado
  }

  // ==========================================
  // MÉTODOS DE REMOÇÃO (DELETE)
  // ==========================================

  async remove(id: string) {
    // Método para REMOVER um usuário
    const user = await this.findOneByOrFail({ id }); // Busca o usuário pelo ID ou lança erro 404 se não existir
    await this.userRepository.delete({ id }); // Remove o usuário do banco de dados
    return user; // Retorna o usuário que foi removido (útil para resposta da API)
  }

  // ==========================================
  // MÉTODO GENÉRICO DE PERSISTÊNCIA
  // ==========================================

  save(user: User) {
    // Método genérico para salvar (inserir ou atualizar) um usuário
    return this.userRepository.save(user); // Salva no banco - se tiver ID atualiza, se não tiver insere
  }
}
