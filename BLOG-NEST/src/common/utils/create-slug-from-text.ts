import { generateRandomSuffix } from './generete-random-suffix'; // Importa a função que gera um sufixo aleatório (ex: 'abc123')
import { slugify } from './slugify'; // Importa a função que converte texto para formato slug (ex: 'Meu Post' → 'meu-post')

export function createSlugFromText(text: string) {
  // Função exportada que recebe um texto e retorna um slug único
  const slug = slugify(text); // Converte o texto para formato slug (remove acentos, substitui espaços por hífens, etc.)
  return `${slug}-${generateRandomSuffix()}`; // Retorna o slug combinado com um sufixo aleatório separado por hífen (ex: 'meu-post-abc123')
}
