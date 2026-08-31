import { UpdateUser } from '@/components/Admin/UpdateUser';
import { SpinLoader } from '@/components/SpinLoader';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic'; //forçando minha pagina a ser dinamica

export const metadata: Metadata = { //nome que vou deixar na guia do navegador
  title: 'User Admin',
};

export default async function AdminUserPage() { //função assicrona para mostrar pagina de admin
  return (
    <Suspense fallback={<SpinLoader className='mb-16' />}> {/**uso o suspense já que vou mostrar um componente que tras dados e isso pode demorar e casod demorar vou deixar um spinloader na tela */}
      <h1>Update user form</h1> {/**titulo de atualização de formulário */}
      <UpdateUser /> {/**componente que vai aparecer na tela que para atualizar o usuário */}
    </Suspense>
  );
}