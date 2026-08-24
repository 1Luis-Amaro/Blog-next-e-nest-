"use client";

import { Button } from "@/components/Button";
import { InputText } from "@/components/InputText";
import { useActionState, useEffect, useState } from "react";
import { ImageUploader } from "../ImageUploader";
import { createPostAction } from "@/actions/post/create-post-action";
import { toast } from "react-toastify";
import { updatePostAction } from "@/actions/post/update-post-action";
import { useRouter, useSearchParams } from "next/navigation";
import { InputCheckBox } from "@/components/InputCheckBox";
import { MarkDownEditor } from "@/components/MarkDownEditor";
import {
  PublicPostForApiDto,
  PublicPostForApiSchema,
} from "@/lib/post/schemas";

type ManagePostFormUpdateProps = {
  // crio um tipo para definir a estrutura das props quando o modo for "update"
  mode: "update"; // defino que o modo é "update" (edição)
  publicPost: PublicPostForApiDto; // os dados do post que vão ser editados (tipo PublicPostForApiDto)
};

type ManagePostFormCreateProps = {
  // crio um tipo para definir a estrutura das props quando o modo for "create"
  mode: "create"; // defino que o modo é "create" (criação)
};

type ManagePostFormProps = // crio um tipo que pode ser um dos dois: update OU create
  ManagePostFormUpdateProps | ManagePostFormCreateProps;

export function ManagePostForm(props: ManagePostFormProps) {
  // função principal do formulário de gerenciamento de posts (criação ou edição)
  const { mode } = props; /// extraio o modo (update ou create) das props
  const searchParams = useSearchParams(); // pego o hook do Next.js para ler parâmetros da URL (ex: ?created=1)
  const created = searchParams.get("created"); // pego o parâmetro "created" da URL (vem da página de criação de post)
  const router = useRouter(); // pego o hook do Next.js para navegação (redirecionar, substituir URL)

  let publicPost; // declaro uma variável para guardar os dados do post (se for update)
  if (mode === "update") {
    // se o modo for "update" (edição)
    publicPost = props.publicPost; // pego os dados do post que vieram nas props
  }

  const actionsMap = {
    //crio um objeto, esses objeto que mapeia cada modo para sua respectiva ação
    update: updatePostAction, // se for update, usa a ação de atualizar
    create: createPostAction, // se for create, usa a ação de criar
  };

  const initialState = {
    /// estado inicial do formulário
    formState: PublicPostForApiSchema.parse(publicPost || {}), // valido os dados do post com o schema público (se for update, usa os dados existentes; se for create, usa objeto vazio)
    errors: [], // array de erros vazio (não há erros no início)
  };
  const [state, action, isPending] = useActionState(
    // hook do React para gerenciar o estado da ação (Server Action)
    actionsMap[mode], // escolho a ação conforme o modo (update ou create)
    initialState, // e pego também o estado inicial
  );

  useEffect(() => {
    // hook que executa quando o componente renderiza ou quando dependências mudam
    if (state.errors.length > 0) {
      // se houver erros no estado
      toast.dismiss(); // removo toasts antigos para não acumular
      state.errors.forEach((error) => toast.error(error)); // percorro cada erro e exibo um toast de erro
    }
  }, [state.errors]); // executo este efeito toda vez que os erros mudarem

  useEffect(() => {
    // hook que executa quando o componente renderiza ou quando dependências mudam
    if (state.success) {
      // se a ação foi bem-sucedida (success = true)
      toast.dismiss(); // removo toasts antigos
      toast.success("Post atualizado com sucesso!"); // exibo toast de sucesso
    }
  }, [state.success]); // executo este efeito toda vez que o sucesso mudar

  useEffect(() => {
    // hook que executa quando o componente renderiza ou quando dependências mudam
    if (created === "1") {
      // se a URL tiver o parâmetro created=1 (vindo da criação de post)
      toast.dismiss(); // removo toasts antigos
      toast.success("Post criado com sucesso!"); // exibo toast de sucesso
      const url = new URL(window.location.href); //// pego a URL atual do navegador
      url.searchParams.delete("created"); // removo o parâmetro "created" da URL (para não mostrar a mensagem novamente se a página for recarregada)
      router.replace(url.toString()); // substituo a URL atual pela URL sem o parâmetro (sem adicionar ao histórico)
    }
  }, [created, router]); // executo este efeito toda vez que o parâmetro "created" ou o router mudarem

  const { formState } = state; // extraio o estado do formulário do state (dados atuais do post)
  const [contentValue, setContentValue] = useState(publicPost?.content || ""); // crio um estado local para o conteúdo do Markdown (inicializado com o conteúdo do post, se existir)

  return (
    //apos isso retorno meu HTML
    <form action={action} className="mb-16">
      {" "}
      {/* formulário que usa a ação do useActionState */}
      <div className="flex flex-col gap-6">
        {" "}
        {/* container com layout flexível e espaçamento vertical */}
        <InputText //input de id
          labelText="ID"
          name="id"
          placeholder="ID gerado automaticamente"
          type="text"
          defaultValue={formState.id} // valor inicial vindo do estado (id do post)
          disabled={isPending} // desabilito  enquanto a ação está rodando
          readOnly // campo apenas para leitura (não pode ser editado)
        />
        {/* CAMPO SLUG (apenas leitura) */}
        <InputText // input para exibir o Slug (gerado automaticamente a partir do título)
          labelText="Slug"
          name="slug"
          placeholder="Slug gerada automaticamente"
          type="text"
          defaultValue={formState.slug} // valor inicial vindo do estado (slug do post)
          disabled={isPending} // desabilito enquanto a ação está rodando
          readOnly
        />
        <InputText
          labelText="Título"
          name="title"
          placeholder="Digite o título"
          type="text"
          defaultValue={formState.title} // valor inicial vindo do estado (título atual)
          disabled={isPending} // desabilito enquanto a ação está rodando
        />
        <InputText
          labelText="Excerto"
          name="excerpt"
          placeholder="Digite o resumo"
          type="text"
          defaultValue={formState.excerpt} //valor inicial vindo do estado (excerto atual)
          disabled={isPending} // desabilito enquanto a ação está rodando
        />
        <MarkDownEditor
          labelText="Conteúdo"
          value={contentValue} // valor atual do conteúdo (gerenciado pelo estado local)
          setValue={setContentValue} // função para atualizar o conteúdo (quando o usuário digita)
          textAreaName="content" // nome do campo (usado no FormData)
          disabled={isPending} // desabilito enquanto a ação está rodando
        />
        {/* UPLOAD DE IMAGEM */}
        <ImageUploader disabled={isPending} />
        {/* CAMPO URL DA IMAGEM DE CAPA */}
        <InputText // input para a URL da imagem de capa
          labelText="URL da imagem de capa"
          name="coverImageUrl"
          placeholder="Digite a url da imagem"
          type="text"
          defaultValue={formState.coverImageUrl} //o valor padrão do input vai ser o estado atual da cover Image
          disabled={isPending} // desabilito enquanto a ação está rodando
        />
        {/* CAMPO PUBLICADO (apenas no modo update) */}
        {mode === "update" && ( //agora se o modo for update mostra o checkbox de publicação
          <InputCheckBox // checkbox para publicar/despublicar o post
            labelText="Publicar?"
            name="published"
            type="checkbox"
            defaultChecked={formState.published}  // valor inicial vindo do estado (publicado ou não)
            disabled={isPending} // desabilito enquanto a ação está rodando
          />
        )}
        {/* e por fim o botão pra enviar o formulário  */}
        <div className="mt-4">
          <Button disabled={isPending} type="submit">
            {" "}
            {/*desabilito enquanto a ação está rodando*/}
            Enviar
          </Button>
        </div>
      </div>
    </form>
  );
}
