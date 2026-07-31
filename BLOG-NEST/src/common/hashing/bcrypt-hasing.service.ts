import { HashingService } from './hashing.service'; // Importa a classe base que define o contrato
import * as bcrypt from 'bcryptjs'; // Importa a biblioteca de criptografia bcrypt

export class BcryptsHashingService extends HashingService {
  // Cria uma classe que herda da base
  async hash(password: string): Promise<string> {
    // Função assíncrona que criptografa a senha e retorna uma Promise com string
    const salt = await bcrypt.genSalt(10); // Gera um salt (texto aleatório) com 10 rounds de segurança e espera o resultado
    const hash = await bcrypt.hash(password, salt); // Criptografa a senha usando o salt e espera o resultado
    return hash; // Retorna a senha criptografada (hash)
  }

  async compare(password: string, hash: string): Promise<boolean> {
    // Função assíncrona que compara senha com hash e retorna Promise com booleano
    const isValid = await bcrypt.compare(password, hash); // Compara a senha digitada com o hash do banco e espera o resultado
    return isValid; // Retorna true se for igual, false se for diferente
  }
}
