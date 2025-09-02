import type { TasksRepository } from '@/repositories/tasks-repository.ts'
import type { UsersRepository } from '@/repositories/users-repository.ts'
import { CommentIsRequiredError } from '../errors/comment-is-required.ts'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.ts'
import { UnauthorizedError } from '../errors/unauthorized-error.ts'
import { InvalidUpdateDataError } from '../errors/invalid-update-data-error.ts'
import type { Comment } from 'generated/prisma/index.js'
import type { CommentsRepository } from '@/repositories/comments-repository.ts'

interface AddCommentToTaskRequest {
  taskId: string
  content: string
  userId: string
}

interface AddCommentToTaskResponse {
  comment: Comment
}

export class AddCommentToTask {
  constructor(
    private commentsRepository: CommentsRepository,
    private tasksRepository: TasksRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    taskId,
    content,
    userId,
  }: AddCommentToTaskRequest): Promise<AddCommentToTaskResponse> {
    if (!content || !content.trim()) {
      throw new CommentIsRequiredError()
    }

    const task = await this.tasksRepository.findById(taskId)

    if (!task) {
      throw new ResourceNotFoundError()
    }

    if (task.is_archived) {
      throw new InvalidUpdateDataError()
    }

    const user = await this.usersRepository.findById(userId)

    if (!user) {
      throw new UnauthorizedError()
    }

    if (task.user_id !== userId) {
      throw new UnauthorizedError()
    }
    const createdComment = await this.commentsRepository.addCommentToTask({
      task_id: taskId,
      content: content.trim(),
      user_id: userId,
    })

    return { comment: createdComment }
  }
}
