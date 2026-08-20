import { findAllPostAdmin, findAllPostFromApiAdmin } from "@/lib/post/queries/admin"; // Importa as funções que buscam posts do banco de dados (local) e da API (NestJS)
import clsx from "clsx"; // Importa a biblioteca clsx para combinar classes CSS condicionalmente
import Link from "next/link"; // Importa o componente Link do Next.js para navegação entre páginas
import { DeletePostButton } from "../DeletePostButton"; // Importa o botão de deletar post
import ErrorMessage from "@/components/ErrorMessage"; // Importa o componente de mensagem de erro

export default async function PostsListAdmin() { // crio uma função que vai fazer uma lista de todos os posts do usuário autenticado

  const postsRes = await findAllPostFromApiAdmin(); // procuro por todos os posts da API (NestJS)

  if (!postsRes.success) { // se eu NÃO tiver sucesso em trazer todos os posts da API (success = false)
    console.log(postsRes.errors); // mando um log no servidor com os erros

    return ( // e lanço um erro na tela do usuário também
      <ErrorMessage
        contentTitle='Ei 😅' // Título da mensagem de erro
        content='Tente fazer login novamente' // Descrição da mensagem de erro
      />
    );
  }

  const posts = postsRes.data; // pego todos os posts que vieram da API (array de posts)

  if (posts.length <= 0) { // se a quantidade de posts for menor ou igual a 0 (não tem posts)
    return (
      <ErrorMessage contentTitle='Ei 😅' content='Bora criar algum post??' /> // mando uma mensagem na tela do usuário incentivando a criar posts
    );
  }

  return (
    <div className="mb-16"> {/* Container com margem inferior */}
      {posts.map((post) => { // vou fazer um loop (map) em cada post
        return (
          <div
            className={clsx( // combino classes CSS condicionalmente
              "py-2 px-2", // padding vertical e horizontal
              "", // classe vazia (poderia ser usada para condicionais)
              !post.published && "bg-slate-300", // se o post NÃO estiver publicado, aplico a cor slate 300 (cinza claro) para destacar que é rascunho
              "flex gap-2 items-center justify-between", // deixo o post em flex, com espaçamento, alinhado ao centro e com espaço entre os elementos
            )}
            key={post.id} // coloco a chave única do post (id) para o React identificar cada elemento
          >
            <Link href={`/admin/post/${post.id}`}>{post.title}</Link> {/* link que leva para a página de edição do post específico */}

            {!post.published && ( // se o post NÃO estiver publicado, mostra um span
              <span className="text-xs text-slate-600 italic">
                (Não publicado) {/* texto indicando que o post é um rascunho */}
              </span>
            )}

            <DeletePostButton id={post.id} title={post.title} /> {/* botão para deletar o post (passo o id e o título) */}
          </div>
        );
      })}
    </div>
  );
}