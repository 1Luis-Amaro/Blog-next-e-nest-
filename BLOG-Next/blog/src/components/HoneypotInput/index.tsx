export function HoneypotInput() { // função que cria um campo invisível (honeypot) para enganar bots em formulários de login ou criação de conta
  return (
    <input // Campo de entrada (será escondido com CSS)
      className='niceInput' // Classe CSS (deve ter display: none ou position: absolute + opacity: 0 para esconder)
      name='dateUpdatedAt' // Nome do campo (nome atraente para bots preencherem)
      type='text' // Tipo texto (bots geralmente preenchem todos os campos de texto)
      autoComplete='new-password' // Dica para o navegador não preencher automaticamente
      tabIndex={-1} // Remove o campo da navegação por TAB (humanos não chegam nele)
      defaultValue='' // Valor inicial vazio (se for preenchido, é bot!)
    />
  );
}