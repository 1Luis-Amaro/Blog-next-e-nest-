import { z } from 'zod';

// Uma base para a validação do usuário
// Criei essa base para usar .refine e .transform
// e validar se a duas senhas são iguais e remover
// a repetição da senha
const CreateUserBase = z.object({ // zod é a forma de eu validar campos, aqui crio uma const nela vou ter objetos e puxo o zod
  name: z.string().trim().min(4, 'Nome precisa ter um mínimo de 4 caracteres'), // campo name: falo que tem que ser string, depois tiro todos os espaços da informação que veio e coloco um valor mínimo que precisa ter
  email: z.string().trim().email({ message: 'E-mail inválido' }), // campo email: falo que tem que ser string, depois tiro todos os espaços da informação que veio e valido se é um e-mail válido
  password: z // campo senha: falo que tem que ser string, depois tiro todos os espaços da informação que veio e coloco um valor mínimo que precisa ter
    .string()
    .trim()
    .min(6, 'Senha precisa ter um mínimo de 6 caracteres'),
  password2: z // campo senha 2: falo que tem que ser string, depois tiro todos os espaços da informação que veio e coloco um valor mínimo que precisa ter
    .string()
    .trim()
    .min(6, 'Confirmação de senha precisa ter um mínimo de 6 caracteres'),
});

export const CreateUserSchema = CreateUserBase.refine( // aqui vou pegar as informações que vão realmente para minha tabela
  data => { // pego as informações do formulário
    return data.password === data.password2; // Confirma se password e password2 são iguais
  },
  {
    // agora se as senhas não forem iguais vou apontar para o campo password2 e colocar uma mensagem dizendo que as senhas estão erradas
    path: ['password2'], // aponta o erro para o campo de confirmação
    message: 'As senhas não conferem',
  },
).transform(({ email, name, password }) => { // depois de ver se as senhas são iguais vou remover o campo password2, já que não preciso dele na minha base de dados
  // Remove o campo password2
  return {
    name,
    email,
    password,
  };
});

export const PublicUserSchema = z.object({ // aqui valido um usuário que já está na minha tabela de usuário (dados que posso expor/publicar)
  id: z.string().default(''), // coloco que o id tem que ser uma string, o default define um valor padrão caso o campo não venha (mas na prática o id sempre virá)
  name: z.string().default(''), // coloco que o name tem que ser uma string, o default define um valor padrão caso o campo não venha
  email: z.string().default(''), // coloco que o email tem que ser uma string, o default define um valor padrão caso o campo não venha
});

export const UpdatePasswordSchema = z // aqui vou validar caso o usuário queira alterar sua senha
  .object({
    currentPassword: z // a senha atual dele deve ser uma string, tiro os espaços dela e falo um mínimo para o campo
      .string()
      .trim()
      .min(6, 'Senha precisa ter um mínimo de 6 caracteres'),
    newPassword: z // aqui falo que a nova senha que ele está tentando criar deve ser uma string, tiro os espaços dela e falo um mínimo para o campo
      .string()
      .trim()
      .min(6, 'Nova senha precisa ter um mínimo de 6 caracteres'),
    newPassword2: z // aqui falo que a confirmação da nova senha que ele está tentando criar deve ser uma string, tiro os espaços dela e falo um mínimo para o campo
      .string()
      .trim()
      .min(6, 'Confirmação de senha precisa ter um mínimo de 6 caracteres'),
  })
  .refine(
    data => { // pego as informações enviadas pelo usuário
      return data.newPassword === data.newPassword2; // Confirma se newPassword e newPassword2 são iguais
    },
    { // agora se as novas senhas não forem iguais vou apontar para o campo newPassword2 e colocar uma mensagem dizendo que as senhas estão erradas
      path: ['newPassword2'], // aponta o erro para o campo de confirmação
      message: 'As senhas não conferem',
    },
  )
  .transform(({ currentPassword, newPassword }) => { // após ele mandar a senha atual e as novas senhas forem iguais vou transformar os dados excluindo a confirmação da nova senha já que não vou precisar dela na minha base de dados
    // Remove o campo newPassword2
    return {
      currentPassword, // mantenho a senha atual
      newPassword, // e a nova senha enviada
    };
  });
//agora digamos que o usuário esteja logado e queira alterar algum dado do perfil sem ser a senha ai vou entrar na rota
export const UpdateUserSchema = CreateUserBase.omit({ // Crio um schema para atualização de usuário esse omit faz como se eu tirasse campos especificos lá do schema CreateUserBase que tem name, email, password e password2
  password: true, // removo o campo password do schema base (não vou usar)
  password2: true, // removo o campo password2 do schema base (não vou usar)
}).extend({}); // .extend adiciona novos campos, mas aqui está vazio porque não preciso de mais campos, deixei esse trecho caso queira manter mais alguma coisa futuramente e pra mostrar que da pra adicionar mais coisas, mas esse trecho no momento é inutil eu poderia até tirar caso quisesse

export type CreateUserDto = z.infer<typeof CreateUserSchema>; // Crio um tipo TypeScript a partir do schema, para usar como DTO (Data Transfer Object)
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>; // Crio um tipo TypeScript a partir do schema, para usar como DTO (Data Transfer Object)
export type PublicUserDto = z.infer<typeof PublicUserSchema>; // Crio um tipo TypeScript a partir do schema, para usar como DTO (Data Transfer Object)
export type UpdatePasswordDto = z.infer<typeof UpdatePasswordSchema>; // Crio um tipo TypeScript a partir do schema, para usar como DTO (Data Transfer Object)