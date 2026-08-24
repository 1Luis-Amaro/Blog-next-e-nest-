import { ManagePostForm } from "@/components/Admin/ManagePostForm";
import { makePublicPostFromDb } from "@/dto/post/dto";
import { findPostByIdAdmin, findPostByIdFromApiAdmin } from "@/lib/post/queries/admin";
import { PublicPostForApiSchema } from "@/lib/post/schemas";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic"; // Forço o Next.js a renderizar esta página de forma dinâmica (não usa cache, sempre gera a página no servidor)

export const metadata: Metadata = { // Defino as informações da página para SEO e para aparecer na aba do navegador
  title: "Editar post", // Defino o título da página como "Editar post"
};

type AdminPostIdPageProps = {  // Crio um tipo para definir a estrutura das props da página
  params: Promise<{  // params é uma Promise que em algum momento vai retornar um objeto com um id
    id: string;  // o id é uma string (vem da URL, ex: /admin/post/123)
  }>;
};

export default async function AdminPostIdPage({ // Função principal da página de edição de post
  params, // Recebe os parâmetros da URL (o id do post)
}: AdminPostIdPageProps) { // Essa função vai ter o tipo que defini, então por regra tem que ter um id
  const { id } = await params; // Aguardo a resolução da Promise params e extraio o id
  const postRes = await findPostByIdFromApiAdmin(id); // Busco o post pelo ID usando a API (NestJS)

if (!postRes.success) { // Se NÃO consegui encontrar o post (success = false)
    console.log(postRes.errors); // no log vou mostrar o erro que deu
    notFound(); /// Chamo a função de "não encontrado" e exibo a página 404
  }
    const post = postRes.data; // Se deu certo, pego os dados do post que veio da API
  const publicPost = PublicPostForApiSchema.parse(post); // Valido os dados do post usando o schema público (garanto que está no formato correto)

  return ( // e vou retornar o html da pagina
    <div className="flex flex-col gap-6">  {/* Container com layout flexível e espaçamento vertical*/}
      <h1 className="text-xl font-extrabold">Editar post</h1>  {/* Título da página */}
      <ManagePostForm  mode="update" publicPost={publicPost} /> {/* Componente do formulário de edição, passando o modo "update" e os dados do post */}
    </div>
  );
}
