import { PostModel } from "@/models/post/post-model";

export interface PostRepository {
  findAllPublic(): Promise<PostModel[]>  //acha todos que estão com published como true
  findBySlugPublic(slug: string): Promise<PostModel>
  findAll(): Promise<PostModel[]> // acha todos incluindo os que não são publicos
  findById(id: string): Promise<PostModel>
  create(post: PostModel): Promise<PostModel>;
  delete(id: string): Promise<PostModel>;
  update(
    id: string,
    newPostData: Omit<PostModel, 'id' | 'slug' | 'createdAt' | 'updatedAt'>,
  ) : Promise<PostModel>

}