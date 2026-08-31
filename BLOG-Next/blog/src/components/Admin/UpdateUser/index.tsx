import { getPublicUserFromApi } from '@/lib/user/api/get-user';
import { UpdateUserForm } from '../UpdateUserForm';
import ErrorMessage from '@/components/ErrorMessage';

export async function UpdateUser() { //função assicrona para atualizar o usuário
  const user = await getPublicUserFromApi(); //pegando o usuário da API

  if (!user) { // se não tiver usuário (token inválido ou expirado)
    return ( //retorno componente de erro
      <ErrorMessage
        contentTitle='🫣' // Título da mensagem de erro
        content='Você precisa fazer login novamente.' // Descrição da mensagem de erro
      />
    );
  }
 //se deu certo buscar o usuário, retorno os dados  atuais dele na tela
  return <UpdateUserForm user={user} />; // Renderiza o formulário de atualização com os dados do usuário
}