'use client';

import { updatePasswordAction } from '@/actions/user/update-user-password-action';
import { Button } from '@/components/Button';
import { InputText } from '@/components/InputText';
import clsx from 'clsx';
import { LockKeyholeIcon } from 'lucide-react';
import { useActionState, useEffect } from 'react';
import { toast } from 'react-toastify';

export function UpdatePasswordForm() { //função para atualizar o formulário de senha
  const [state, action, isPending] = useActionState(updatePasswordAction, { // Hook que gerencia o estado da Server Action de atualização de senha
    errors: [], // array de erros (começa vazio
    success: false, // estado de sucesso (começa como false)
  });

  //hook de efeito do Next
  useEffect(() => {
    toast.dismiss(); //limpo todas as mensagens do toast que estão na tela

    if (state.errors.length > 0) { //se o tamanho do estado de erro for mais que 0 quer dizer que tem erros
      state.errors.forEach(error => toast.error(error)); //passo por cada um desses erros e lanço os erros na tela
    }

    if (state.success) { //se deu certo
      toast.success('Atualizado com sucesso'); //lanço essa mensagem de sucesso
    }
  }, [state]); //vou rodar esse efeito todo momento que o state alterar

  return ( //HTML da página
    <div
      className={clsx(
        'flex items-center justify-center',
        'text-center max-w-sm mt-16 mb-32 mx-auto',
      )}
    >
      <form action={action} className='flex-1 flex flex-col gap-6'> {/**formuçário de troca de senha */}
        <InputText
          type='password'
          name='currentPassword'
          labelText='Senha antiga'
          placeholder='Sua senha antiga'
          disabled={isPending} // Desabilito o campo enquanto a action está rodando (isPending = true)
          defaultValue={''} //o valor padrão é vazio
        />

        <InputText
          type='password'
          name='newPassword'
          labelText='Senha nova'
          placeholder='Sua nova senha'
          disabled={isPending}  // Desabilito o campo enquanto a action está rodando (isPending = true)
          defaultValue={''} //o valor padrão é vazio
        />

        <InputText
          type='password'
          name='newPassword2'
          labelText='Repetir senha nova'
          placeholder='Sua nova senha novamente'
          disabled={isPending}  // Desabilito o campo enquanto a action está rodando (isPending = true)
          defaultValue={''} //o valor padrão é vazio
        />

        <div className='flex items-center justify-center mt-4'>
          <Button size='md' disabled={isPending} type='submit'> {/*/// Desabilito o campo enquanto a action está rodando (isPending = true)*/}
            <LockKeyholeIcon /> {/**icone  do meu botão */}
            Atualizar senha
          </Button>
        </div>
      </form>
    </div>
  );
}