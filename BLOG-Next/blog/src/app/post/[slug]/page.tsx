import { SinglePost } from "@/components/SinglePost";
import { SpinLoader } from "@/components/SpinLoader";
import {findPublicPostBySlugFromApiCached } from "@/lib/post/queries/public";
import { Metadata } from "next";
import { Suspense } from "react";

type PostSlugPageProps = {  // Crio um tipo para definir a estrutura das props da página
  params: Promise<{ slug: string }>; // params é uma Promise que em algum momento vai retornar um objeto com a slug (vem da URL)
};

export async function generateMetadata({ /// Função especial do Next.js que gera metadados dinâmicos para SEO (título, descrição)
  params, // Recebe os parâmetros da URL (a slug do post)
}: PostSlugPageProps): Promise<Metadata> {//Esta função usa o tipo que criei e promete retornar um objeto do tipo Metadata
  const { slug } = await params;  // Aguardo a resolução da Promise params e extraio a slug
 const postRes = await findPublicPostBySlugFromApiCached(slug);  // Busco o post pela slug usando a API (com cache)

  if (!postRes.success) { //se essa busca deu erro
    return {}; // Retorno um objeto vazio (sem título e descrição, o Next.js usa os valores padrão)
  }

  const post = postRes.data; //se enonctrar pego todos os posts os dados deles

  return {  /// Retorno os metadados para o SEO
    title: post.title, // Título da página (aparece na aba do navegador e no resultado de busca)
    description: post.excerpt, /// Descrição da página (aparece no resultado de busca)
  };
}

// Função principal da página de post único (ex: /post/meu-primeiro-post)
export default async function PostSlugPage({ params }: PostSlugPageProps) { // Recebe os parâmetros da URL (slug) e usa o tipo que criei
  const { slug } = await params; // Aguardo a resolução da Promise params e extraio a slug

  return ( //HTLM que vou retornar
    <Suspense fallback={<SpinLoader className="min-h-20 mb-16" />}> {/* Suspense: mostra o SpinLoader enquanto o SinglePost está carregando */}
      <SinglePost slug={slug} />  {/* Componente que busca e exibe o post completo usando a slug */}
    </Suspense>
  );
}
