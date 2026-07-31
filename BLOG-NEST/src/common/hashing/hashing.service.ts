export abstract class HashingService {
  // Classe abstrata que serve como "molde" para outros serviços de criptografia
  abstract hash(password: string): Promise<string>; // Método obrigatório: criptografa a senha e retorna uma Promise com string
  abstract compare(password: string, hash: string): Promise<boolean>; // Método obrigatório: compara senha com hash e retorna Promise com booleano
}
