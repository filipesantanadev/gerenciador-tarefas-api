import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryTasksRepository } from '@/repositories/in-memory/in-memory-tasks-repository.ts'
import { FetchTasksByTagUseCase } from './fetch-tasks-by-tag.ts'
import { InMemoryTagsRepository } from '@/repositories/in-memory/in-memory-tags-repository.ts'
import type { Tag } from 'generated/prisma/index.js'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.ts'

let tagsRepository: InMemoryTagsRepository
let tasksRepository: InMemoryTasksRepository
let sut: FetchTasksByTagUseCase

describe('Fetch Tasks by Tag Use Case', () => {
  beforeEach(() => {
    const sharedTags: Tag[] = []

    tagsRepository = new InMemoryTagsRepository(sharedTags)
    tasksRepository = new InMemoryTasksRepository(sharedTags)
    sut = new FetchTasksByTagUseCase(tasksRepository, tagsRepository)
  })

  it('should be able to fetch tasks by tag', async () => {
    await tagsRepository.create({
      id: 'tag-1',
      name: 'teste-1',
      creator: { connect: { id: 'user-1' } },
    })

    await tagsRepository.create({
      id: 'tag-2',
      name: 'teste-2',
      creator: { connect: { id: 'user-1' } },
    })

    // TASKS

    await tasksRepository.create({
      title: 'Urgente',
      user_id: 'user-1',
      tags: { connect: { id: 'tag-1' } },
    })

    await tasksRepository.create({
      title: 'Urgente 2',
      user_id: 'user-1',
      tags: { connect: { id: 'tag-2' } },
    })

    await tasksRepository.create({
      title: 'Todo',
      user_id: 'user-1',
      tags: { connect: { id: 'tag-1' } },
    })

    await tasksRepository.create({
      title: 'Urgente',
      user_id: 'user-2',
      tags: { connect: { id: 'tag-1' } },
    })

    const { tasks } = await sut.execute({
      tagId: 'tag-1',
      page: 1,
    })

    expect(tasks).toHaveLength(3)
  })

  it('should not be able to fetch tasks by tag when tagId is empty string', async () => {
    await expect(() =>
      sut.execute({
        tagId: '',
        page: 1,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to fetch tasks by tag when tag no exist.', async () => {
    await expect(() =>
      sut.execute({
        tagId: 'tag-1',
        page: 1,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
