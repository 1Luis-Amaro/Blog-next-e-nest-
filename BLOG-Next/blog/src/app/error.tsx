"use client"

import ErrorMessage from "@/components/ErrorMessage";
import { useEffect } from "react";

type RootErrorPageProps = {
  error: Error;
  reset: () => void
}

export default function RootErrorPage({error} : RootErrorPageProps) {
  useEffect(() => {
    console.log
  }, [error])

  return (
    <ErrorMessage
    pageTitle="Internal Server Error"
    contentTitle="501"
    content="Ocorreu um erro do qual nossa aplicação não conseguiu se recuperar. Tente novamente mais tarde."
    />
  )
}