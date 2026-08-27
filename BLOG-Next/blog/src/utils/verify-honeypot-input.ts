import { asyncDelay } from './async-delay';

// Use HoneypotInput in your form before using this function
// const isBot = await verifyBotHoneypot(formData, 5000);

export async function verifyHoneypotInput(formData: FormData, delay = 3000) { // Função que verifica se o envio do formulário foi feito por um bot. Recebe os dados do formulário e um delay (tempo mínimo que um humano levaria para preencher)
  await asyncDelay(delay); // Espera o tempo definido (delay) para verificar se o formulário foi preenchido muito rápido (bots preenchem em milissegundos)

  const niceInputValue = formData.get('dateUpdatedAt'); // Pega o valor do campo honeypot (campo invisível que bots preenchem, humanos não)

    const isBot = // Verifica se é um bot:
    niceInputValue !== null && // Se o campo EXISTE no formulário
    typeof niceInputValue === 'string' && // E é uma string
    niceInputValue.trim() !== ''; // E NÃO está vazio → É BOT! (humano não preencheu porque não viu o campo)

  return isBot; // Retorna true se for bot, false se for humano
}