import {
  Controller, // Decorator que marca a classe como um controlador de rotas HTTP
  Post, // Decorator que define uma rota que responde a requisições POST (envio de dados)
  UploadedFile, // Decorator que extrai o arquivo enviado na requisição (acessa o arquivo que veio no upload)
  UseGuards, // Decorator que aplica um guarda (proteção) em uma rota específica
  UseInterceptors, // Decorator que aplica um interceptor (middleware que processa a requisição antes do controller)
} from '@nestjs/common'; // Importa todas as ferramentas principais do NestJS

import { FileInterceptor } from '@nestjs/platform-express'; // Importa o interceptor que processa uploads de arquivos (usa o multer por baixo dos panos)

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'; // Importa o guard de autenticação JWT para proteger as rotas

import { storage, limits, fileFilter } from './upload.config'; // Importa as configurações de upload: storage (onde salvar), limits (tamanho máximo), fileFilter (tipos permitidos)

import { UploadService } from './upload.service'; // Importa o service que contém a lógica de negócio para uploads

@Controller('upload') // Define que todas as rotas deste controller começam com /upload (ex: /upload, /upload/me)
export class UploadController {
  // Declara a classe do controlador de uploads
  constructor(private readonly uploadService: UploadService) {}
  // Injeta o service de uploads no controller (injeção de dependência)

  @Post() // Define que este método responde a POST na rota /upload (envio de arquivo)
  @UseGuards(JwtAuthGuard) // Aplica o guard de autenticação - apenas usuários com token JWT válido podem fazer upload
  @UseInterceptors(FileInterceptor('file', { storage, limits, fileFilter }))
  // Aplica o interceptor de arquivo que processa o upload antes do controller
  // 'file': nome do campo no formulário que contém o arquivo (ex: <input type="file" name="file">)
  // storage: configuração de onde salvar o arquivo (disco, memória, etc.)
  // limits: configuração de limites (tamanho máximo do arquivo, etc.)
  // fileFilter: configuração de filtro (quais tipos de arquivo são permitidos)
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    // Extrai o arquivo enviado na requisição após ser processado pelo FileInterceptor
    // Express.Multer.File é o tipo do arquivo que o Multer retorna (contém nome, tamanho, caminho, etc.)
  ) {
    return this.uploadService.handleUpload(file);
    // Chama o service para processar o upload do arquivo
    // Passa o arquivo recebido para o service lidar com ele (salvar, processar, etc.)
    // Retorna a resposta do service (ex: { message: 'Upload realizado com sucesso', file: '...' })
  }
}
