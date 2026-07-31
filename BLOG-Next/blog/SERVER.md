# Servidor


Comandos para iniciar o site do zero:
```sh
#Ter o node instalado
#Instalar todos os pacotes
npm i
#Configure o .env.local
#no arquivo generate-hased-password.ts gere uma assinatura jwt e depois uma hash de senha mesmo
#Criar o banco
npm run migrate
#npm run seed - Seed é  opcional
#build do next
npm run build
npm start #-apenas para teste

```
