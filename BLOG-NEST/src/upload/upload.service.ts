import { BadRequestException, Injectable } from '@nestjs/common';
// Importa o BadRequestException para lançar erros 400 (requisição inválida)
// Importa o Injectable para marcar a classe como um serviço injetável

import { fileTypeFromBuffer } from 'file-type';
// Importa a biblioteca 'file-type' que identifica o tipo real do arquivo lendo o buffer (bytes)
// Útil para validar que o arquivo é realmente uma imagem, mesmo que a extensão seja falsa

import { writeFileSync, existsSync, mkdirSync } from 'fs';
// Importa funções do módulo 'fs' (file system) do Node.js
// writeFileSync: salva um arquivo no disco de forma síncrona
// existsSync: verifica se um diretório existe
// mkdirSync: cria um diretório

import { resolve } from 'path';
// Importa a função resolve do módulo 'path' que resolve caminhos de arquivos
// Converte caminhos relativos em caminhos absolutos

import { generateRandomSuffix } from 'src/common/utils/generete-random-suffix';
// Importa a função que gera um sufixo aleatório (ex: 'abc123') para evitar nomes duplicados

@Injectable()
// Marca a classe como um serviço que pode ser injetado em outros lugares (controllers, outros services)
export class UploadService {
  // Declara a classe do serviço de uploads

  async handleUpload(file: Express.Multer.File) {
    // Método assíncrono que processa o upload do arquivo
    // file: arquivo enviado pelo cliente, já processado pelo Multer
    // Express.Multer.File é o tipo do arquivo que o Multer retorna

    if (!file) {
      // Verifica se o arquivo foi enviado (se não foi, file é undefined ou null)
      throw new BadRequestException('Nenhum arquivo enviado.');
      // Lança erro 400 (Bad Request) com mensagem personalizada
    }

    const maxFileSize = 900 * 1024;
    // Define o tamanho máximo permitido: 900KB
    // 900 * 1024 = 921,600 bytes (~900KB)

    if (file.size > maxFileSize) {
      // Verifica se o tamanho do arquivo (em bytes) é maior que o limite
      throw new BadRequestException('Arquivo muito grande');
      // Lança erro 400 (Bad Request) se o arquivo for muito grande
    }

    const fileType = await fileTypeFromBuffer(file.buffer);
    // Lê o buffer do arquivo (os bytes) para identificar o tipo real do arquivo
    // fileTypeFromBuffer retorna o tipo MIME e extensão baseado no conteúdo (não na extensão)
    // Exemplo: { mime: 'image/jpeg', ext: 'jpg' }

    if (
      // Verifica se o arquivo NÃO é uma imagem válida
      !fileType ||
      // Se fileType for null ou undefined (não reconheceu o tipo)

      !['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(
        fileType.mime,
      )
      // Verifica se o tipo MIME do arquivo está na lista de tipos permitidos
      // Só aceita: PNG, JPEG, WebP, GIF
    ) {
      throw new BadRequestException('Arquivo inválido ou tipo não permitido.');
      // Lança erro 400 (Bad Request) se o arquivo não for uma imagem válida ou tipo não permitido
    }

    const today = new Date().toISOString().split('T')[0];
    // Pega a data de hoje no formato ISO (YYYY-MM-DD)
    // new Date() → data atual
    // .toISOString() → "2024-01-15T10:30:00.000Z"
    // .split('T')[0] → "2024-01-15" (pega apenas a data)
    // Isso cria pastas organizadas por dia

    const uploadPath = resolve(__dirname, '..', '..', 'uploads', today);
    // Cria o caminho absoluto para a pasta onde o arquivo será salvo
    // __dirname: diretório atual do arquivo (ex: /app/src/upload)
    // '..' sobe um nível (ex: /app/src)
    // '..' sobe mais um nível (ex: /app)
    // 'uploads' → pasta uploads
    // today → subpasta com a data de hoje
    // Resultado: /app/uploads/2024-01-15

    if (!existsSync(uploadPath)) {
      // Verifica se a pasta já existe no sistema de arquivos
      mkdirSync(uploadPath, { recursive: true });
      // Cria a pasta (e todas as subpastas necessárias) se ela não existir
      // recursive: true → cria pastas intermediárias se necessário
    }

    const uniqueSuffix = `${Date.now()}-${generateRandomSuffix()}`;
    // Gera um sufixo único para o nome do arquivo
    // Date.now() → timestamp atual (ex: 1705321800000)
    // generateRandomSuffix() → string aleatória (ex: 'abc123')
    // Resultado: "1705321800000-abc123"

    const fileExtension = fileType.ext;
    // Pega a extensão do arquivo identificada pelo file-type (ex: 'jpg', 'png', 'webp')
    // ⚠️ É a extensão REAL baseada no conteúdo, não a extensão do nome original!

    const fileName = `${uniqueSuffix}.${fileExtension}`;
    // Cria o nome final do arquivo: "1705321800000-abc123.jpg"
    // Combina o sufixo único com a extensão identificada

    const fileFullPath = resolve(uploadPath, fileName);
    // Cria o caminho completo do arquivo: /app/uploads/2024-01-15/1705321800000-abc123.jpg
    // Combina a pasta de upload com o nome do arquivo

    // Salvar o buffer no disco
    writeFileSync(fileFullPath, file.buffer);
    // Salva o arquivo no disco de forma síncrona
    // file.buffer: dados binários do arquivo (vem do memoryStorage)
    // writeFileSync: cria/escreve o arquivo no caminho especificado

    return {
      // Retorna um objeto com a URL pública do arquivo
      url: `/uploads/${today}/${fileName}`,
      // URL: /uploads/2024-01-15/1705321800000-abc123.jpg
      // Essa URL será usada para acessar o arquivo via browser
    };
  }
}
