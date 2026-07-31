export function generateRandomSuffix() {
  // Função exportada que gera um sufixo aleatório para slugs
  return Math.random().toString(36).substring(2, 8); // Gera uma string aleatória de 6 caracteres usando base36 (0-9 e a-z)
}
