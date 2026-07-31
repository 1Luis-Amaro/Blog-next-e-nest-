import clsx from "clsx"; // Importa a função clsx para combinar classes CSS dinamicamente
import { Button } from "../Button";

type DialogProps = {
  // Define o tipo das propriedades do componente Dialog
  isVisible?: boolean; // Controla se o diálogo está visível (opcional)
  title: string; // Título exibido no topo do diálogo
  content: React.ReactNode; // Conteúdo do diálogo (JSX, texto ou componente)
  onConfirm: () => void; // Função chamada ao clicar em "Ok"
  onCancel: () => void; // Função chamada ao cancelar o diálogo
  disabled: boolean; // Define se as ações do diálogo estão desabilitadas
};

export function Dialog({
  // Declara o componente Dialog
  isVisible = false, // Valor padrão caso a prop não seja informada
  title, // Recebe o título do diálogo
  content, // Recebe o conteúdo do diálogo
  onConfirm, // Recebe a função de confirmação
  onCancel, // Recebe a função de cancelamento
  disabled, // Recebe o estado de desabilitado
}: DialogProps) {
  // Aplica o tipo DialogProps às propriedades

  if (!isVisible) return null; // Não renderiza nada se o diálogo não estiver visível

  function handleCancel() {
    // Função responsável por tratar o cancelamento
    if (disabled) return; // Impede a ação se o diálogo estiver desabilitado
    onCancel(); // Executa a função de cancelamento
  }

  return (
    // Início do JSX retornado pelo componente
    <div
      className={clsx(
        // Combina as classes CSS do overlay
        "fixed z-50 top-0 bottom-0 left-0 right-0 bg-black/50 backdrop-blur-xs", // Fundo escuro com blur ocupando toda a tela
        "flex items-center justify-center", // Centraliza o diálogo na tela
      )}
      onClick={handleCancel} // Clique fora do modal dispara o cancelamento
    >
      <div
        className={clsx(
          // Combina as classes CSS do container do diálogo
          "bg-slate-100 p-6 rounded-lg max-w-2xl mx-6", // Estilo visual do diálogo
          "flex flex-col gap-6", // Layout em coluna com espaçamento
          "shadow-lg shadow-black/30 text-center", // Sombra e centralização de texto
        )}
        role="dialog" // Define semanticamente este elemento como um diálogo
        aria-modal={true} // Indica que o diálogo é modal (acessibilidade)
        aria-labelledby="dialog-title" // Relaciona o título ao diálogo
        aria-describedby="dialog-description" // Relaciona a descrição ao diálogo
        onClick={(e) => e.stopPropagation()} // Impede fechar o modal ao clicar dentro dele
      >
        <h3 id="dialog-title" className="text-xl font-extrabold">
          {" "}
          {/* Título do diálogo */}
          {title} {/* Renderiza o título recebido via props */}
        </h3>
        <div id="dialog-description">{content}</div>{" "}
        {/* Renderiza o conteúdo do diálogo */}
        <div className="flex items-center justify-around">
          {" "}
          {/* Container dos botões */}
          <Button
            variant="ghost"
            autoFocus
            onClick={handleCancel}
             disabled={disabled}

            >
            Cancelar</Button>
          <Button
            variant="default"
            onClick={onConfirm}
            disabled={disabled} // Controla o estado desabilitado
            size="lg"
          >
            Ok
          </Button>
        </div>
      </div>
    </div>
  );
}
