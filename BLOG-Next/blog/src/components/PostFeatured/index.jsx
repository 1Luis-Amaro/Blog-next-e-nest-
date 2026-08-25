import { postRepository } from "@/repositories/post";
import ErrorMessage from "../ErrorMessage";
import { PostCoverImage } from "../PostCoverImage";
import { PostSummary } from "../PostSummary";
import {  findAllPublicPostsFromApiCached } from "@/lib/post/queries/public";

//função para mostrar os post em destaque
export async function PostFeatured() {
  const postsRes = await findAllPublicPostsFromApiCached(); // Busca todos os posts públicos da API (NestJS)
  const noPostsFound = (// Crio um componente de erro para quando não houver posts
    <ErrorMessage //chamo meu componente que mostra um erro amigavel
      contentTitle='Ops 😅'// Título da mensagem de erro (passado por props)
      content='Ainda não criamos nenhum post.'  // Descrição da mensagem de erro (passado por props)
    />
  );

  if (!postsRes.success) { // Se a requisição para buscar os posts NÃO foi bem-sucedida
    return noPostsFound; // Retorno o componente de erro (não há posts para mostrar)
  }

  const posts = postsRes.data; // Se deu certo, pego todos os dados dos posts (array de posts)

if (posts.length <= 0) { // Se a quantidade de posts for menor ou igual a 0 (não há posts)
    return noPostsFound; //retorno o componente  de erro
  }

  const post = posts[0]; //agora se tiver dados, se tiver posts... , pego o primeiro post da lista (índice 0) para ser o post em destaque

  const postLink = `/post/${post.slug}`; // Crio o link para a página do post usando o slug (ex: /post/meu-primeiro-post)

  //HTML que vou mostrar se tiver dados, os posts...
  return (
    <section className="grid grid-cols-1 gap-8 mb-16 sm:grid-cols-2 group"> {/** faço uma sessão */}
      <PostCoverImage  // Componente que exibe a imagem de capa do post em destaque
        linkProps={{  // Props para o link (envolve a imagem)
          href: postLink, // Link para a página do post
        }}
        //configuração da imagem principal que vai aparecer
        imageProps={{
          width: 1200,
          height: 720,
          src: post.coverImageUrl,
          alt: post.title,
          priority: true,
        }}
      />

      <PostSummary // Componente que exibe o resumo do post em destaque
        postLink={postLink} // Link para a página do post
        postHeading="h2" // Nível do título (h2)
        createdAt={post.createdAt} // Data de criação do post
        excerpt={post.excerpt} // Excerto (resumo) do post
        title={post.title} // Título do post
      />
    </section>
  );
}
