import type {
  CommentsRepository,
  CommentWithUser,
} from '@/repositories/comments-repository.ts'

interface ListTaskCommentsUseCaseRequest {
  taskId: string
}

interface ListTaskCommentsUseCaseResponse {
  comments: CommentWithUser[]
}

export class ListTaskCommentsUseCase {
  constructor(private commentsRepository: CommentsRepository) {}

  async execute({
    taskId,
  }: ListTaskCommentsUseCaseRequest): Promise<ListTaskCommentsUseCaseResponse> {
    const comments = await this.commentsRepository.findManyByTaskId(taskId)

    return { comments }
  }
}
