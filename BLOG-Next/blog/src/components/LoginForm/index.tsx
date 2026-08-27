"use client";
import { InputText } from "@/components/InputText";
import clsx from "clsx";
import { LogInIcon } from "lucide-react";
import { Button } from "@/components/Button";
import { useActionState, useEffect } from "react";
import { loginAction } from "@/actions/login/login-actions";
import { toast } from "react-toastify";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { HoneypotInput } from "../HoneypotInput";

export function LoginForm() { // função que cria o formulário de login
  const initialState = { // estado inicial do formulário
    email: "", // email vazio (não tem nada digitado ainda)
    errors: [], // array de erros vazio (não tem erros no início)
  };
  const [state, action, isPending] = useActionState(loginAction, initialState); // uso o hook useActionState do React para gerenciar o estado da action. state = dados atuais (email, errors), action = função para disparar a action, isPending = true enquanto a action está rodando
  const router = useRouter() // pego o gerenciador de rotas do Next.js (permite navegar entre páginas)
  const searchParams = useSearchParams() // pego os parâmetros da URL (ex: ?userChanged=1&created=1)
  const userChanged = searchParams.get('userChanged') // busco o parâmetro "userChanged" na URL (vem da página de edição de usuário)
  const created = searchParams.get('created') // busco o parâmetro "created" na URL (vem da página de criação de usuário)

  useEffect(() => {
    if (state.errors.length > 0) { // se tiver algum erro no estado
      toast.dismiss() // removo todos os toasts que estão na tela (para não acumular)
      state.errors.forEach(e => toast.error(e)) // percorro cada erro e exibo um toast de erro para cada um
    }
  }, [state]) // executo este efeito toda vez que o estado mudar (quando a action retornar uma resposta)

  useEffect(() => {
    if (userChanged === '1') { // se a URL tem ?userChanged=1 (vindo da página de edição de usuário)
      toast.dismiss(); // removo toasts antigos
      toast.success('Seu usuário foi modificado. Faça login novamente.'); // mostro mensagem de sucesso
      const url = new URL(window.location.href); // crio um objeto URL a partir da URL atual do navegador para poder manipular os parâmetros
      url.searchParams.delete('userChanged'); // removo o parâmetro "userChanged" da URL (para não ficar mostrando a mensagem novamente se a página for recarregada)
      router.replace(url.toString()); // substituo a URL atual pela URL sem o parâmetro (não adiciona ao histórico do navegador)
    }

    if (created === '1') { // se a URL tem ?created=1 (vindo da página de criação de usuário)
      toast.dismiss(); // removo toasts antigos
      toast.success('Seu usuário criado.'); // mostro mensagem de sucesso
      const url = new URL(window.location.href); // crio um objeto URL a partir da URL atual do navegador para poder manipular os parâmetros
      url.searchParams.delete('created'); // removo o parâmetro "created" da URL (para não ficar mostrando a mensagem novamente se a página for recarregada)
      router.replace(url.toString()); // substituo a URL atual pela URL sem o parâmetro (não adiciona ao histórico do navegador)
    }
  }, [userChanged, created, router]); // executo este efeito toda vez que userChanged, created ou router mudarem

  return (
    <div // div que vai conter o formulário
      className={clsx( // uso o clsx para combinar classes CSS condicionalmente
        "flex items-center justify-center", // defino o layout como flex e centralizo verticalmente e horizontalmente
        "text-center max-w-sm mt-16 mb-32 mx-auto", // centralizo o texto, limito a largura máxima, defino margens superior e inferior
      )}
    >
      <form action={action} className="flex-1 flex flex-col gap-6"> {/* formulário que usa a action do useActionState (aciona a Server Action ao enviar) */}
        <InputText // campo para o usuário digitar o e-mail
          type="email"
          name="email" // nome do campo (obrigatório para o FormData)
          labelText="E-mail"
          placeholder="Seu email"
          disabled={isPending} // desabilito o campo enquanto a action está rodando (isPending = true)
          defaultValue={state.email} // valor inicial vindo do estado (para reexibir o que o usuário digitou)
          required
        />

        <InputText // campo para o usuário digitar a senha
          type="password"
          name="password" // nome do campo (obrigatório para o FormData)
          labelText="Senha"
          placeholder="Sua senha"
          disabled={isPending} // desabilito o campo enquanto a action está rodando
          required
        />

        <HoneypotInput /> {/**componente que tem um campo invisivel para enganar bots */}

        <Button disabled={isPending} type="submit" className="mt-4"> {/* botão de envio, desabilitado enquanto a action está rodando */}
          <LogInIcon /> {/* ícone de login (lucide-react) */}
          Entrar
        </Button>

        <p className='text-sm/tight'>
          <Link href='/user/new'>Criar minha conta</Link> {/* link para a página de criação de conta (para usuários que não têm cadastro) */}
        </p>
      </form>
    </div>
  );
}