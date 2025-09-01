import type { Tag, Task } from 'generated/prisma/index.js'
import { InvalidCredentialsError } from '../errors/invalid-credentials-error.ts'
import type { UsersRepository } from '@/repositories/users-repository.ts'
import type { TasksRepository } from '@/repositories/tasks-repository.ts'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.ts'
import type { TagsRepository } from '@/repositories/tags-repository.ts'
import { UnauthorizedError } from '../errors/unauthorized-error.ts'

interface AddTagsToTaskUseCaseRequest {
  taskId: string
  userId: string
  tags: Array<{ id?: string; name?: string }>
}

interface AddTagsToTaskUseCaseResponse {
  task: Task
  addedTags: Tag[]
}

export class AddTagsToTaskUseCase {
  constructor(
    private tasksRepository: TasksRepository,
    private usersRepository: UsersRepository,
    private tagsRepository: TagsRepository,
  ) {}

  async execute({
    taskId,
    userId,
    tags,
  }: AddTagsToTaskUseCaseRequest): Promise<AddTagsToTaskUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      throw new InvalidCredentialsError()
    }

    const task = await this.tasksRepository.findById(taskId)

    if (!task) {
      throw new ResourceNotFoundError()
    }

    if (task.user_id !== userId) {
      throw new UnauthorizedError()
    }

    const resolvedTags: Tag[] = []

    for (const tagInput of tags) {
      let tag: Tag | null = null

      if (tagInput.id) {
        tag = await this.tagsRepository.findById(tagInput.id)

        if (tag && tag.created_by !== userId) {
          throw new UnauthorizedError()
        }
      }

      if (!tag && tagInput.name) {
        tag = await this.tagsRepository.findByNameAndUserId(
          tagInput.name,
          userId,
        )
      }

      if (!tag && tagInput.name) {
        tag = await this.tagsRepository.create({
          name: tagInput.name,
          creator: {
            connect: { id: userId },
          },
        })
      }
      if (!tag) {
        throw new ResourceNotFoundError()
      }

      resolvedTags.push(tag)
    }

    const updatedTask = await this.tasksRepository.addTags(
      taskId,
      resolvedTags.map((tag) => tag.id),
    )

    if (!updatedTask) {
      throw new ResourceNotFoundError()
    }

    return {
      task: updatedTask,
      addedTags: resolvedTags,
    }
  }
}
