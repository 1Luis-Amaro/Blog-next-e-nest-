import { CreateUserForm } from "@/components/CreateUserForm"; // importo o componente de formulário de criação de usuário que está na pasta components
import { Metadata } from "next"; // importo o tipo Metadata do Next.js para definir as informações da página (título, descrição, etc)

export const dynamic = 'force-dynamic' // forço o Next.js a renderizar esta página de forma dinâmica (não usa cache, sempre gera a página no servidor)

export const metadata: Metadata = { // defino as informações da página para SEO e para aparecer na aba do navegador
  title: 'Crie sua conta', // defino o título da página como "Crie sua conta"
}

export default async function CreateUserPage() { // crio a função principal da página, que é assíncrona (pode buscar dados antes de renderizar)
  return <CreateUserForm/> // retorno o componente do formulário de criação de usuário para ser renderizado na tela
}