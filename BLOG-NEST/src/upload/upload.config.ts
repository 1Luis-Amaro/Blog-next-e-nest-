import { memoryStorage } from 'multer'; // Importa o storage que guarda os arquivos na memória RAM (em vez de salvar no disco)

import { BadRequestException } from '@nestjs/common'; // Importa a exceção para requisições inválidas (400 Bad Request)

// Isso é o storage do multer
// O memory storage fica na memória do servidor
export const storage = memoryStorage();
// Cria uma instância do memoryStorage do Multer
// ⚠️ Quando usa memoryStorage, o arquivo fica na memória (RAM) e NÃO é salvo no disco
// Útil para: processar imagens, validar antes de salvar, ou enviar para serviços (ex: AWS S3)
// Cuidado: arquivos grandes podem consumir muita memória!

export const fileFilter = (
  // Função que filtra quais arquivos podem ser aceitos no upload
  req: any,
  // Objeto da requisição HTTP (contém headers, body, etc.) - não está sendo usado aqui

  file: Express.Multer.File,
  // Arquivo enviado na requisição (contém: mimetype, originalname, size, buffer, etc.)

  cb: (error: Error | null, acceptFile: boolean) => void,
  // Callback que o Multer chama para decidir se aceita ou rejeita o arquivo
  // error: se houver erro, passa o erro
  // acceptFile: true para aceitar, false para rejeitar
) => {
  if (!file.mimetype.startsWith('image/')) {
    // Verifica se o tipo MIME do arquivo começa com 'image/'
    // Exemplos de tipos MIME de imagem: image/jpeg, image/png, image/gif, image/webp
    // file.mimetype.startsWith('image/') → true para imagens, false para outros tipos

    return cb(
      // Chama o callback rejeitando o arquivo
      new BadRequestException('Somente imagens são permitidas!'),
      // Passa um erro BadRequestException com mensagem personalizada
      // ⚠️ Isso é um erro que será capturado pelo NestJS e retornado ao cliente

      false,
      // Rejeita o arquivo (não aceita)
    );
  }

  cb(null, true);
  // Se chegou aqui, o arquivo é uma imagem (tipo MIME começa com 'image/')
  // Chama o callback aceitando o arquivo
  // null = sem erro, true = aceita o arquivo
};

export const limits = {
  // Objeto com limites para o upload
  // fileSize: 900 * 1024, // Limite de 900KB por imagem
  // ⚠️ O campo fileSize está comentado, então NÃO há limite de tamanho!
  // 900 * 1024 = 921,600 bytes (aproximadamente 900KB)
  // Se você descomentar, arquivos maiores que 900KB serão rejeitados
};
