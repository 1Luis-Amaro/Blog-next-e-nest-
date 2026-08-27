'use client';

import { InputText } from "@/components/InputText";
import clsx from "clsx";
import { UserRoundIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "../Button";
import { useActionState, useEffect } from "react";
import { createUserAction } from "@/actions/user/create-user-action";
import { PublicUserSchema } from "@/lib/user/schemas";
import { toast } from "react-toastify";
import { HoneypotInput } from "../HoneypotInput";

export function CreateUserForm() {
   const [state, action, isPending] = useActionState(createUserAction, { // useActionState gerencia o estado da action. state = dados atuais, action = função para disparar a action,
   //  isPending = true enquanto a action está rodando (gerenciado automaticamente)
    user: PublicUserSchema.parse({}), /// estado inicial do usuário (vazio, mas com a estrutura do schema público)
    errors: [], //começo com os erros vazios
    success: false, // success começa como false (ainda não foi criado)
  });

  useEffect(() => { // Roda sempre que o state mudar (ex: após a action retornar)
    toast.dismiss(); // Remove todos os toasts que estão na tela antes de mostrar os novos
    if (state.errors.length > 0) { //se tiver algum erro no estado
      state.errors.forEach(error => toast.error(error)); //percorre cada erro e exibe um toast de erro
     }
  }, [state]); // A função executa quando o state mudar. Se não houver erros ou sucesso, não faz nada (apenas mantém o estado atual)


  return (
    <div
      className={clsx(
        "flex items-center justify-center",
        "text-center max-w-sm mt-16 mb-32 mx-auto",
      )}
    >
      {/* campo para inserir o nome  */}
        <form action={action} className="flex-1 flex flex-col gap-6"> {/* action = função que será chamada ao enviar o formulário */}
        <InputText
          type="text"
          name="name" // Nome do campo (obrigatório para o FormData)
          labelText="Nome"
          placeholder="Seu nome"
          disabled={isPending} // desabilita o campo enquanto a action está rodando
          defaultValue={state.user.name} // valor inicial vindo do estado (para reexibir o que o usuário digitou)
          required
        />
        <InputText
          type="email"
          name="email" // Nome do campo (obrigatório para o FormData)
          labelText="E-mail"
          placeholder="Seu e-mail"
          disabled={isPending}
          defaultValue={state.user.email}
          required
        />
        <InputText
          type="password"
          name="password" // Nome do campo (obrigatório para o FormData)
          labelText="Senha"
          placeholder="Sua senha"
          disabled={isPending}
          required
        />
        <InputText
          type="password"
          name="password2" // Nome do campo (obrigatório para o FormData)
          labelText="Repetir senha"
          placeholder="Sua senha novamente"
          disabled={isPending}
          required
        />

                <HoneypotInput/>

        <Button
          disabled={isPending} // isPending = true enquanto a action está rodando (desde o clique até a resposta). Desabilito o botão e mostro "Criando..." para evitar duplo clique
          type="submit"
          className="mt-4"
        >
          <UserRoundIcon />
          {/* // se não estiver pendente, mostra "Criar conta" */}
          {!isPending && 'Criar conta'}

          {/* // se estiver pendente, mostra "Criando..." */}
          {isPending && 'Criando...'}
        </Button>

        <p className="text-sm/tight">
          <Link href="/login">Já tem conta? Entrar</Link> {/* Link para a página de login */}
        </p>
      </form>
    </div>
  );
}