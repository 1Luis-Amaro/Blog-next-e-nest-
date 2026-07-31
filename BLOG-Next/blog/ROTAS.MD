```
SSR -> Server Side Rendering - "O Html por exemplo é renderizado no lado do servidor primeiro"
CSR -> Client Side Rendering - "É renderizado no navegador do cliente"

Rota
Static / SSG -> Tenho o HTML pronto, uma página estatica, a pagina não irá atualizar se eu não ocnfigurar porque ela fica salva no cash não busca nada no servidor
Dynamic -> Não tenho nada pronto
ISR - > Incremental Static Regeneration, é a combinação do SSG com o Dynamic, posso ter uma pagina estatica mas depois de um tempo pode ela pode se tornar Dynamic

/ (Pública)
/post/[slug] (Pública)

/admin/post (Privado - Dynamic) - Ler (R) Lista de posts / (D) Delete
/admin/post/[id] (Privado - Dynamic) - Atualizar um post (U)
/admin/post/new (Privado - Dynamic) - Criar um post (C)

/admin/login (Dynamic) - Fazer o login do usuário
```