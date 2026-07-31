'use server'

import { makePartialPublicPost, makePublicPostFromDb, PublicPost } from "@/dto/post/dto"
import { verifyLoginSession } from "@/lib/login/manage-login";
import { PostUpdateSchema } from "@/lib/post/validation";
import { PostModel } from "@/models/post/post-model";
import { postRepository } from "@/repositories/post";
import { makeRandomString } from "@/utils/make-random-string";
import { revalidateTag } from "next/cache";


type UpdatePostActionState = {
  formState: PublicPost;
  errors: string[];
  success?: string;

}

export async function updatePostAction(
  prevState: UpdatePostActionState,
  formData: FormData,
):
  Promise<UpdatePostActionState> {
  const isAuthenticated = await verifyLoginSession()


  if (!(formData instanceof FormData)) {
    return {
      formState:
        prevState.formState,
      errors: ['Dados inválidos']

    }
  }

  const id = formData.get('id')?.toString() || ''

  if (!id || typeof id !== 'string') {
    return {
      formState:
        prevState.formState,
      errors: ['ID inválido']

    }
  }

  const formDataToObj = Object.fromEntries(formData.entries())
  const zodParseObj = PostUpdateSchema.safeParse(formDataToObj)

   if (!isAuthenticated) {
     return {
      formState: makePartialPublicPost(formDataToObj),
       errors: ['Faça login em outra aba antes de salvar']
      }
    }

  if (!zodParseObj.success) {

    const errors = zodParseObj.error.issues.map(issue => issue.message); return {
      errors,
      formState: makePartialPublicPost(formDataToObj),

    }
  }

  const validPostData = zodParseObj.data;
  const newPost = {
    ...validPostData,
  }

  let post: PostModel;
  try {
    post = await postRepository.update(id, newPost)
  } catch (e: unknown) {
    if (e instanceof Error) {
      return {
        formState: makePartialPublicPost(formDataToObj),
        errors: [e.message]
      }
    }

    return {
      formState: makePartialPublicPost(formDataToObj),
      errors: ['Erro desconhecido']
    }
  }

  revalidateTag('posts')
  revalidateTag(`post-${post.slug}`)

  return {
    formState: makePublicPostFromDb(post),
    errors: [],
    success: makeRandomString(),
  }

}