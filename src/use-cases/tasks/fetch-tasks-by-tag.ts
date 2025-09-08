import type {
  TasksRepository,
  TaskWithRelations,
} from '@/repositories/tasks-repository.ts'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.ts'
import type { TagsRepository } from '@/repositories/tags-repository.ts'

interface FetchTasksByTagUseCaseRequest {
  tagId: string
}

interface FetchTasksByTagUseCaseResponse {
  tasks: TaskWithRelations[]
}

export class FetchTasksByTagUseCase {
  constructor(
    private tasksRepository: TasksRepository,
    private tagsRepository: TagsRepository,
  ) {}

  async execute({
    tagId,
  }: FetchTasksByTagUseCaseRequest): Promise<FetchTasksByTagUseCaseResponse> {
    if (tagId.trim() === '') {
      throw new ResourceNotFoundError()
    }

    const tag = await this.tagsRepository.findById(tagId)

    if (!tag) {
      throw new ResourceNotFoundError()
    }

    const tasksByTag = await this.tasksRepository.findManyByTagId(tagId)

    return { tasks: tasksByTag }
  }
}
