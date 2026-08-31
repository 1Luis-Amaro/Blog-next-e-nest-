'use client';

import { deleteUserAction } from '@/actions/user/delete-user-action';
import { updateUserAction } from '@/actions/user/update-user-action';
import { Button } from '@/components/Button';
import { Dialog } from '@/components/Dialog';
import { InputText } from '@/components/InputText';
import { PublicUserDto } from '@/lib/user/schemas';
import { asyncDelay } from '@/utils/async-delay';
import clsx from 'clsx';
import { LockKeyholeIcon, OctagonXIcon, UserPenIcon } from 'lucide-react';
import Link from 'next/link';
import { useActionState, useEffect, useState, useTransition } from 'react';
import { toast } from 'react-toastify';

type UpdateUserFormType = {
  user: PublicUserDto
}

export function UpdateUserForm({user}: UpdateUserFormType) { // Função principal do formulário de atualização de usuário
  const [state, action, isPending] = useActionState(updateUserAction, { // Hook que gerencia o estado da Server Action
    user, // Dados atuais do usuário (vem das props)
    errors: [], // Array de erros vazio (começa sem erros)
    success: false, // Estado de sucesso começa como false
  })
  const [isDialogVisible, setIsDialogVisible] = useState(false);  // Estado que controla se o diálogo de confirmação está visível (inicia false = oculto)
  const [isTransitioning, startTransition] = useTransition();// Hook do React para gerenciar transições (usado para desabilitar elementos enquanto o diálogo está aberto)
  const safetyDelay = 10000; // Tempo de segurança (10 segundos) que os botões ficam desabilitados após o diálogo aparecer (para evitar cliques acidentais)
  const isElementsDisabled = isTransitioning || isPending ; //const para deixar os elementos da pagina desativado, então se está na transition deixo desabilitado

  function showDeleteAccountDialog( /// Função que mostra o diálogo de confirmação de exclusão de conta
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, // Evento de clique do mouse (para prevenir o comportamento padrão do link)
  ) {
    e.preventDefault(); // Previne que o link navegue para outra página (href='#' não vai para lugar nenhum)
    setIsDialogVisible(true); // Torna o diálogo visível (true)

    startTransition(async () => { //como abri a tela de deleção inicio a transition que vai deixar os elementos desativados
      await asyncDelay(safetyDelay);  // Espera o tempo de segurança (10 segundos) antes de reabilitar os elementos
    });
  }

  function handleDeleteUserAccount() { //função de deletar usuário
    startTransition(async () => { //assim que chamo essa função começo a transição então vou deixar os botões desativados
      if(!confirm('Confirma só mais uma vez que quer continuar'))// confirm(): função nativa do navegador que exibe uma caixa de diálogo com "OK" e "Cancelar" (se o usuário clicar em "Cancelar", retorna false)
         return // Se o usuário clicou em "Cancelar" (confirm retornou false), interrompe a execução e fecha a caixa de diálogo
      const result = await deleteUserAction() // Se o usuário confirmou, chama a Server Action que deleta a conta

      if(result.errors) {  // Se a exclusão retornou erros (array com mensagens)
        toast.dismiss()  // Remove todos os toasts que estão na tela (para não acumular)
        result.errors.forEach(e => toast.error(e)) // Percorro cada erro e exibe um toast de erro
      }
      setIsDialogVisible(false) // Se a exclusão deu certo (ou mesmo se deu erro), fecha o diálogo de confirmação
    })
  }

  useEffect(()=> { // Hook que executa quando o componente renderiza ou quando dependências mudam
    toast.dismiss() // Remove toasts antigos para não acumula

    if(state.errors.length > 0 ) {  // Se houver erros no estado (array com mensagens)
      state.errors.forEach(error => toast.error(error))  // Percorre cada erro e exibe um toast de erro
    }

    if(state.success) { // Se a ação foi bem-sucedida (success = true)
      toast.success('Atualizado com sucesso') //então envio uma mensagem de sucesso
    }
  })

  return (
    <div
      className={clsx(
        'flex items-center justify-center', // Centraliza vertical e horizontalmente
        'text-center max-w-sm mt-16 mb-32 mx-auto', // Centraliza texto, limita largura, define margens
      )}
    >
       {/* Formulário de atualização (action será preenchida depois) */}
      <form action={action} className='flex-1 flex flex-col gap-6'>
        <InputText // Campo para o usuário digitar o novo nome
          type='text'
          name='name' // Nome do campo (usado no FormData)
          labelText='Nome'  // Rótulo do campo
          placeholder='Seu nome' //informação que vai aparecer no campo
          disabled={isElementsDisabled} // Desabilito o campo enquanto a transição está ativa (diálogo aberto)
          defaultValue={state.user.name} // Valor inicial vazio (será preenchido com os dados do usuário)
        />
      {/**input de inserção do novo e-mail */}
        <InputText
          type='text'
          name='email'
          labelText='E-mail'
          placeholder='Seu e-mail'
          disabled={isElementsDisabled} // Desabilito o campo enquanto a transição está ativa (diálogo aberto)
          defaultValue={state.user.email}// Valor inicial vazio (será preenchido com os dados do usuário)
        />


        <div className='flex items-center justify-center mt-4'> {/* Container do botão de atualizar */}
          <Button size='md' disabled={isElementsDisabled} type='submit'>  {/* Botão de envio do formulário */}
            <UserPenIcon /> {/* Ícone de usuário com caneta (atualizar) */}
            Atualizar
          </Button>
        </div>

        <div className='flex gap-4 items-center justify-between mt-8'> {/* Container dos links de ações secundárias */}
          <Link // Link para a página de troca de senha
            className={clsx(
              'flex gap-2 items-center justify-center transition', // Layout flexível, espaçamento e transição suave
              'hover:text-blue-600', // Ao passar o mouse, fica azul
            )}
            href='/admin/user/password' // Caminho para a página de troca de senha
          >
            <LockKeyholeIcon /> {/* Ícone de cadeado */}
            Trocar senha
          </Link>

          <Link /// Link que abre o diálogo de exclusão de conta (não navega para lugar nenhum)
            className={clsx(
              'flex gap-2 items-center justify-center transition',
              'text-red-600 hover:text-red-700', // Cor vermelha (perigo) e fica mais escuro ao passar o mouse
            )}
            href='#' // Link falso (não navega)
            onClick={showDeleteAccountDialog} // Ao clicar, mostra o diálogo de confirmação
          >
            <OctagonXIcon /> {/* Ícone de octógono com X (perigo) */}
            Apagar conta
          </Link>
        </div>
      </form>

      <Dialog // Componente de diálogo (modal) para confirmar a exclusão da conta
        content={ // Conteúdo do diálogo (mensagem de aviso)
          <p>
            Ao apagar meu usuário, meus dados e todos os meus posts também serão
            excluídos. Essa ação é IRREVERSÍVEL. Em alguns segundos os botões
            serão liberados. Clique em <b>OK</b> para confirmar ou{' '}
            <b>Cancelar</b> para fechar essa janela.
          </p>
        }
        disabled={isElementsDisabled} // Desabilita os botões do diálogo enquanto a transição está ativa
        onCancel={() => setIsDialogVisible(false)} // Ao cancelar, fecha o diálogo
        onConfirm={handleDeleteUserAccount} // Ao confirmar, executa a exclusão
        isVisible={isDialogVisible} // Controla se o diálogo está visível
        title='Apagar meu usuário'
      />
    </div>
  );
}