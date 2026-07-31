import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch() // Decorator que diz: "Este filtro captura TODAS as exceções" (não especifica nenhuma)
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);
  // Classe que implementa a interface ExceptionFilter Isso obriga a ter o método catch()
  catch(exception: unknown, host: ArgumentsHost) {
    //exception: o erro que foi lançado (pode ser qualquer coisa: Error, HttpException, string, etc.) já o host: objeto que contém a requisição e resposta (contexto HTTP
    const response = host.switchToHttp().getResponse<Response>();
    // host.switchToHttp() faz a minha requisição se mudar para o contexto HTTP
    // .getResponse<Response>(): quem fornece as respostas HTTP é o express sendo assim uso o getResponse paga pegar a resposta do express
    // response: mesmo eu pegando a resposta do express preciso esclarecer qual é o tipo de resposta e o Respnse faz exatamente isso

    const isHttpException = exception instanceof HttpException; // // Aqui faço a seguinte PERGUNTA: "Este erro é um HttpException?" (SIM ou NÃO)

    const status = isHttpException //pego a pergunta que fiz se é ou não um erro HTTP
      ? exception.getStatus() //se o erro tem get.status isso confirma que é um erro HTTP, sendo assim pego o status do erro
      : HttpStatus.INTERNAL_SERVER_ERROR; //senão uso o erro interno o 500

    const defaultMessage = 'Internal Server Error'; //defini uma mensagem padrão
    const defaultError = 'Internal Server Error'; //defini o meu erro padrão

    let messages: string[] = [defaultMessage]; // inicializo mensagens com a mensagem padrao que criei, É um array porque podem ter VÁRIOS erros (ex: validações)

    let errorName = defaultError; //inicializo error com a mensagem padrao que criei

    if (isHttpException) {
      const responseData = exception.getResponse(); //se eu tenho uma erro http pego a resposta dele e coloco dentro da minha constante responseData

      if (typeof responseData === 'string') {
        messages = [responseData]; //se o tipo da resposta que peguei da minha exceção for do formato string substitua a mensagem padrão pela que veio que veio do servidor
      }

      if (typeof responseData === 'object' && responseData !== null) {
        //já se a resposta for do tipo objeto e não for null
        const { message, error } = responseData as Record<string, any>; //extraio a message e o error do objeto o "as Record" falo o seguinte pro TypeScript "Te garanto que o responseData é um objeto, o string confirmo que o nome do objeto é uma string e os valores lá de dentro do objeto pode ser qualquer coisa "

        if (Array.isArray(message)) {
          //após o message ter sido extraido verifico se ele é um array, se for quer dizer que possui vários erros
          messages = message as string[]; //sendo um array com varios erros, converto todos eles em string
        } else if (typeof message === 'string') {
          //agora se o array de erros for do tipo string
          messages = [message]; //pega essas messages de erro e colque na minha const messages
        }
        if (typeof error === 'string') {
          //ja se o tipo de error for uma string
          errorName = error; // substituo a mensagem padrão por esse erro que veio por string
        }
      }
    }

    if (!(exception instanceof HttpException)) {
      this.logger.error(
        `Erro interno inesperado`,
        (exception as Error).stack || 'sem stack',
      );
    } else {
      this.logger.warn(`${status} - ${errorName}: ${messages.join(' | ')}`);
    }

    return response.status(status).json({
      //após fazer todas as verificações retorno uma resposta para o usuário, respondo o status que o get.status pegou na função la em cima, em formato json
      message: messages, //em message vou usar o meu let que criei com a informação padrão ou com a que foi incluida conforme a verificação nos if, Exemplo: ['Post não encontrado']
      error: errorName, //em err vou usar a informação do let que criei com a informação padrão ou com a que foi incluida conforme a verificação nos if , Exemplo: 'Not Found'
      statusCode: status, //em statusCode: o código do erro, Exemplo: 404
    });
  }
}
