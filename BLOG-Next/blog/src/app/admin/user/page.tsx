import { SpinLoader } from "@/components/SpinLoader";
import { Metadata } from "next";
import { Suspense } from 'react';

export const dynamic = 'force-dynamic'; //forçando minha pagina ser dinamica

export const metadata: Metadata = {
  title: 'User Admin', //passando o texto da aba do navegador
};

export default async function AdminUserPage() { //função da pagina de admin do usuário
  return (
    <Suspense fallback={<SpinLoader className='mb-16' />}>  {/* Suspense: mostra o SpinLoader enquanto o conteúdo está carregando */}
      <h1>Update user form</h1> {/* Título da página (será mostrado depois que carregar) */}
    </Suspense>
  );
}