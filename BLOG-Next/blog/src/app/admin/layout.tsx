import { MenuAdmin } from "@/components/Admin/MenuAdmin";
import { requireLoginSessionForApiOrRedirect } from "@/lib/login/manage-login";

type AdminPostLayoutProps = { //tipo que criei para padronizar a estrutura do meu código
  children: React.ReactNode; /// children: qualquer conteúdo que o React possa renderizar (texto, HTML, componentes, etc)
}

export default async function AdminPostLayout({ // Função principal do layout administrativo
  children,  // Recebe o conteúdo da página que será renderizado dentro do layout
}: Readonly<AdminPostLayoutProps>) { // Readonly: torna as props somente leitura (não podem ser modificadas). Uso o tipo que criei para garantir a estrutura
  await requireLoginSessionForApiOrRedirect() // Verifico se o usuário está logado; se não estiver, redireciono para a página de login
  return ( // Retorno o HTML do layout
    <>
      <MenuAdmin /> {/* Componente do menu administrativo (sidebar ou navbar)*/}
      {children} {/* Conteúdo da página (vem da rota /admin/post/*) */}
    </>
  );
}
