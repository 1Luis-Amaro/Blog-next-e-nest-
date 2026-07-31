import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'; // Importa decorators e exceções do NestJS, incluindo Logger para logging

import { InjectRepository } from '@nestjs/typeorm'; // Decorator que injeta o repositório no service

import { Post } from './entities/post.entity'; // Importa a entidade Post (representa a tabela 'posts' no banco)

import { Repository } from 'typeorm'; // Importa o Repository do TypeORM para operações no banco de dados

import { CreatePostDto } from './dto/create-post.dto'; // Importa o DTO para CRIAR um post (title, excerpt, content, coverImageUrl)

import { User } from 'src/user/entities/user.entity'; // Importa a entidade User (representa a tabela 'users' no banco)

import type { UpdatePostDto } from './dto/update-post.dto';
import { createSlugFromText } from 'src/common/utils/create-slug-from-text';

@Injectable() // Marca a classe como um serviço que pode ser injetado em outros lugares (controllers, outros services)
export class PostService {
  // Declara a classe do serviço de posts
  private readonly logger = new Logger(PostService.name); // Cria uma instância do Logger específica para esta classe (usa o nome da classe como contexto)

  constructor(
    // Construtor da classe PostService
    @InjectRepository(Post) // Decorador que injeta o repositório do Post para operações no banco
    private readonly postRepository: Repository<Post>, // Repositório que permite fazer operações CRUD no banco (save, find, delete, etc.)
  ) {} // Construtor que injeta o repositório de posts

  async findOne(postData: Partial<Post>) {
    //aqui estou criando uma função chamada findOne o mesmo nome do metodo do typeOrm, dessa forma eu encapsulo esse metodo e coloco em post, e o postData faz um filtor na tabela
    const post = await this.postRepository.findOne({
      //aqui chamo o metodo findOne que vai buscar um unico post no banco e jogo tudo na const post
      where: postData, //Filtra o post pelos campos fornecidos em postData
      relations: {
        // ← Usar OBJETO, não array, antes dava certo usar array agora tenho que fazer dessa forma
        author: true, // Carrega os dados do autor junto com o post (JOIN)
      },
    });
    return post; // e depois me retorne esse post
  }

  async findAll(postData: Partial<Post>) {
    //Crio uma função que busca POSTS com filtros opcionais
    const post = await this.postRepository.find({
      //aqui de fato pego dados da tablea usando o find que é diferente do findOne que procurava somente um, o find busca varios, como não vou usar essa função em outros lugares não encapsulei o find já usei ele direto
      where: postData, // Filtra os posts pelos campos fornecidos em postData
      order: {
        createdAt: 'DESC',
      },
      relations: {
        // ← Usar OBJETO, não array
        author: true, // ← Carrega os dados do autor junto com cada post (JOIN)
      },
    });
    return post; //Retorna uma LISTA DE POSTS (array de Post)
  }

  //e se não encontrar esse post que estou pedindo faz a função abaixo que trás um erro se não encontrar e fala post não encontrado

  async findOneOrFail(postData: Partial<Post>) {
    //aqui estou pegando parte da tabela de post e colocando nela o nome de postData
    const post = await this.findOne(postData); // aqui de fato pego dados da tablea usando o findOne função que eu criei encapsulando o metodo findOne e jogo tudo na const post
    if (!post) {
      //se o post não vier
      throw new NotFoundException('Post não encontrado'); //lanço um erro falando que o post não foi encontrado
    }
    return post; // e aqui se passar pelo if vai me trazer o post
  }
  async findOneOwned(postData: Partial<Post>, author: User) {
    //crio a função findOneOwned passo pra ela como parametro parte da tabela de post e todos os meus usuários criados em post
    const post = await this.postRepository.findOne({
      //aqui de fato pego dados da tablea usando o findOne função que eu criei encapsulando o metodo findOne do typeORM e jogo tudo na const post
      where: {
        //o where completo faz o seguinte, pega um unico post, o spread operator(...) me da a opção de qual campo vou querer fazer a pesquisa, slug, titulo ou id, e o a parte do author fala que tem que ser daquele determinado usuário/author especifico
        ...postData, // ← Filtro específico (id, slug, title, etc.)
        author: { id: author.id }, // ← Garante que é do autor
      },
      relations: {
        // ← Usar OBJETO, não array
        author: true, // ← true significa "carregue esta relação"
      },
    });
    return post; // e aqui retorna apenas um unico post
  }

  async findAllOwned(author: User) {
    // Crio uma função que busca TODOS os POSTS de um autor específico
    // author: usuário autenticado (req.user) - usado para filtrar os posts dele
    const post = await this.postRepository.find({
      //aqui de fato pego dados da tablea usando o find que é diferente do findOne que procurava somente um, o find busca varios, como não vou usar essa função em outros lugares não encapsulei o find já usei ele direto
      where: {
        //nesse where completo faço o seguinte Filtro os posts para trazer apenas do autor específico
        author: { id: author.id }, // SQL: WHERE authorId = 10 (id do usuário logado)
      },
      order: {
        createdAt: 'DESC', // 'DESC' = ordem decrescente (do mais recente para o mais antigo)
      },
      relations: {
        // ← Usar OBJETO, não array
        author: true, // Carrega os dados do autor junto com cada post (JOIN)
      },
    });
    return post; // Retorna uma LISTA DE POSTS do autor (array de Post)
  }

  async findOneOwnedOrFail(postData: Partial<Post>, author: User) {
    //aqui estou criando uma função que nela contem parte da tabela de post, e todos os usuários da tabela de post também
    const post = await this.findOneOwned(postData, author); //aqui reutilizo uma função que busca um post de um usuário autenticado
    if (!post) {
      //se post não vier informo que o post não foi encontrado
      throw new NotFoundException('Post não encontrado');
    }
    return post; // se vier retorno o post
  }

  async update(postData: Partial<Post>, dto: UpdatePostDto, author: User) {
    // Pego parte do post e coloco no postData, pego as informações que chegou no DTO de update, e pego o usuário autenticado vem la do req.user
    if (Object.keys(dto).length === 0) {
      // se os dados que chegarem no DTO de update estiverem vazio ai lanço um erro
      throw new BadRequestException('Dados não enviados'); //lançando erro
    }

    const post = await this.findOneOwnedOrFail(postData, author); // reutilizo a função já criada findOneOwnedOrFail para me mandar o post do usuario autenticado ou lançar um erro se não vier, e passei o parametro que tem parte da tabela e o author do post

    post.title = dto.title ?? post.title; // pego o titulo do post lá do banco, Atualiza o título SE o usuário enviou um novo título
    post.content = dto.content ?? post.content; // Atualiza o conteúdo SE o usuário enviou um novo conteúdo
    post.excerpt = dto.excerpt ?? post.excerpt; // Atualiza o excerto SE o usuário enviou um novo excerto
    post.coverImageUrl = dto.coverImageUrl ?? post.coverImageUrl; // Atualiza a imagem SE o usuário enviou uma nova imagem
    post.published = dto.published ?? post.published; // Atualiza o status SE o usuário enviou um novo status

    return this.postRepository.save(post); // depois de verificar pra todos salvo as novas informações la no meu banco
  }

  async remove(postData: Partial<Post>, author: User) {
    //postData é o filtro da minha tabela vai vir o id lá do param e a partir disso realizo o filtro
    const post = await this.findOneOwnedOrFail(postData, author); // reutilizo a função de pegar um post ou retornar erro
    await this.postRepository.delete({
      // aqui pego o metodo de delete
      ...postData, //o spred ... "copia" todas as propriedades de postData para dentro do objeto
      author: { id: author.id }, //Adiciona a condição: o post deve pertencer ao author autenticado // SQL: WHERE id = 5 AND authorId = 10
    });
    return post; //// Retorna o post que foi deletado (útil para a resposta da API) // Os dados ainda estão na variável 'post' mesmo após deletar
  }

  async create(dto: CreatePostDto, author: User) {
    // Método assíncrono para CRIAR um novo post, recebe os dados do post e o autor (usuário logado)
    const post = this.postRepository.create({
      // Cria uma nova instância da entidade Post no banco de dados (não salva ainda)
      slug: createSlugFromText(dto.title), // Gera um slug único a partir do título usando a função createSlugFromText (slugify + sufixo aleatório)
      author, // Usuário que está criando o post (relacionamento ManyToOne com User)
      content: dto.content, // Conteúdo principal do post vindo do DTO
      excerpt: dto.excerpt, // Excerto/resumo do post vindo do DTO
      coverImageUrl: dto.coverImageUrl, // URL da imagem de capa do post vindo do DTO (opcional)
      title: dto.title, // Título do post vindo do DTO
    }); // Cria o objeto Post com os dados fornecidos

    const created = await this.postRepository.save(post).catch((e: unknown) => {
      // Tenta salvar o post no banco, captura qualquer erro que ocorra
      if (e instanceof Error) {
        // Verifica se o erro capturado é uma instância de Error (tem stack trace)
        this.logger.error('Erro ao criar post', e.stack); // Registra o erro no log com stack trace para debugging
      }
      throw new BadRequestException('Erro ao criar o post'); // Lança uma exceção de Bad Request com mensagem amigável para o cliente
    }); // Salva o post no banco de dados e retorna o post salvo com ID gerado e timestamps

    return created; // Retorna o post criado (com ID, timestamps, etc.)
  }
}
