import { findAllPublicPostsFromApiCached } from "@/lib/post/queries/public"; // Importa a função que busca todos os posts públicos da API (com cache)
import { PostCoverImage } from '../PostCoverImage'; // Importa o componente que exibe a imagem de capa do post
import { PostSummary } from '../PostSummary'; // Importa o componente que exibe o resumo do post (título, excerto, data)
import ErrorMessage from "../ErrorMessage"; // Importa o componente de mensagem de erro

// Função que exibe a lista de todos os posts públicos (exceto o primeiro, que fica em destaque)
export async function PostsList() {

  const postsRes = await findAllPublicPostsFromApiCached(); // Busca todos os posts públicos da API (com cache)

  if (!postsRes.success) { // Se a requisição NÃO foi bem-sucedida
    return null; // Retorna null (não renderiza nada, evita erro na tela)
  }

  const posts = postsRes.data; // Se deu certo, pego todos os dados dos posts

  if (posts.length <= 1) { // Se a quantidade de posts for menor ou igual a 1 (só tem o post em destaque ou nenhum)
    return null; // Retorna null (não renderiza a lista, pois não há posts para mostrar além do destaque)
  }

  return ( // Retorna o HTML com a lista de posts
    <div className='grid grid-cols-1 mb-16 gap-8 sm:grid-cols-2 lg:grid-cols-3'> {/* Container com layout responsivo: 1 coluna em mobile, 2 em tablet, 3 em desktop */}

      {posts.slice(1).map(post => { // Pego todos os posts a partir do índice 1 (pula o primeiro, que já está em destaque) e faço um loop
        const postLink = `/post/${post.slug}`; // Crio o link para a página do post usando o slug

        return ( // Retorno o HTML de cada post
          <div className='flex flex-col gap-4 group' key={post.id}> {/* Container do post com layout flexível, espaçamento e chave única para o React */}
            <PostCoverImage // Componente que exibe a imagem de capa do post
              linkProps={{ // Props para o link (envolve a imagem)
                href: postLink, // Link para a página do post
              }}
              imageProps={{ // Props para a imagem de capa
                width: 1200, // Largura da imagem em pixels
                height: 720, // Altura da imagem em pixels
                src: post.coverImageUrl, // URL da imagem de capa
                alt: post.title, // Texto alternativo da imagem (título do post)
              }}
            />

            <PostSummary // Componente que exibe o resumo do post
              postLink={postLink} // Link para a página do post
              postHeading='h2' // Nível do título (h2)
              createdAt={post.createdAt} // Data de criação do post
              excerpt={post.excerpt} // Excerto (resumo) do post
              title={post.title} // Título do post
            />
          </div>
        );
      })}

    </div>
  );
}