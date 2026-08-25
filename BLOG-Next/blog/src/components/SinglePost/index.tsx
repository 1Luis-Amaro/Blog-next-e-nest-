import { findPublicPostBySlugFromApiCached } from "@/lib/post/queries/public"; // Importa a função que busca um post público pelo slug (com cache)
import Image from "next/image"; // Importa o componente Image do Next.js (otimizado para imagens)
import { PostHeading } from "../PostHeading"; // Importa o componente que exibe o título do post com link
import { PostDate } from "../PostDate"; // Importa o componente que formata e exibe a data do post
import { SafeMarkdown } from "../SafeMarkdown"; // Importa o componente que renderiza conteúdo Markdown de forma segura (sanitizado)
import { notFound } from "next/navigation"; // Importa a função que dispara a página de "não encontrado" (404)

type SinglePostProps = { // Crio um tipo para definir a estrutura das props do componente
  slug: string; // O slug do post (identificador amigável na URL)
};

// Função que busca e exibe um único post completo
export async function SinglePost({ slug }: SinglePostProps) { // Recebo o slug como parâmetro e uso o tipo que criei
  const postRes = await findPublicPostBySlugFromApiCached(slug); // Busco o post pela slug usando a API (com cache)

  if (!postRes.success) { // Se a busca NÃO foi bem-sucedida (post não encontrado ou erro)
    notFound(); // Exibo a página 404 (não encontrado)
  }

  const post = postRes.data; // Se deu certo, pego os dados do post

  return ( // Retorno o HTML do post completo
    <div> {/* Container principal do post */}
      <article className="mb-16"> {/* Artigo com margem inferior de 16 */}
        <header className="group flex flex-col gap-4 mb-4"> {/* Cabeçalho do post com layout flexível, espaçamento de 4 e margem inferior de 4 */}
          <Image // Componente do Next.js para imagens otimizadas (lazy loading, redimensionamento)
            className="rounded-xl" // Classe para deixar a imagem com bordas arredondadas
            src={post.coverImageUrl} // URL da imagem de capa
            width={1200} // Largura da imagem em pixels
            height={720} // Altura da imagem em pixels
            alt={post.title} // Texto alternativo (acessibilidade e SEO)
          />

          <PostHeading url={`/post/${post.slug}`}> {/* Componente que exibe o título com link para o post */}
            {post.title} {/* Título do post */}
          </PostHeading>

          <p> {/* Parágrafo com autor e data */}
            {post.author.name} | <PostDate dateTime={post.createdAt} /> {/* Nome do autor + componente de data formatada */}
          </p>
        </header>

        <p className="text-xl mb-4 text-slate-600"> {/* Excerto (resumo) do post com tamanho de fonte maior e cor cinza */}
          {post.excerpt}
        </p>

        <SafeMarkdown markdown={post.content} /> {/* Componente que renderiza o conteúdo em Markdown de forma segura (sanitizado) */}
      </article>
    </div>
  );
}