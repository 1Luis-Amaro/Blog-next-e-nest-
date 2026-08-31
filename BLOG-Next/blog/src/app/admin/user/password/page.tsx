import { UpdatePasswordForm } from '@/components/Admin/UpdateUserPassword';
import { SpinLoader } from '@/components/SpinLoader';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic'; //forço a pagina a ser dinamica

export const metadata: Metadata = { //nome que vai aparecer na guia do meu navegador
  title: 'Trocar senha',
};

export default async function AdminUserPage() { //função para mostrar a pagina de adm que tem o form de senha
  return ( //retornando meus componentes
    <Suspense fallback={<SpinLoader className='mb-16' />}> {/** suspense para caso as informações do meu formulário demorarem para aparecer ele mostrar um spinloader na tela */}
      <UpdatePasswordForm/> {/**formulário de troca de senha */}
    </Suspense>
  );
}