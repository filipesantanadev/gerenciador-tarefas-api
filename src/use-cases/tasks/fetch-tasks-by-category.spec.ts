import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryTasksRepository } from '@/repositories/in-memory/in-memory-tasks-repository.ts'
import { FetchTasksByCategoryUseCase } from './fetch-tasks-by-category.ts'
import { InMemoryCategoriesRepository } from '@/repositories/in-memory/in-memory-categories-repository.ts'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.ts'

let tasksRepository: InMemoryTasksRepository
let categoriesRepository: InMemoryCategoriesRepository
let sut: FetchTasksByCategoryUseCase

describe('Fetch Tasks by Category Use Case', () => {
  beforeEach(() => {
    tasksRepository = new InMemoryTasksRepository()
    categoriesRepository = new InMemoryCategoriesRepository()
    sut = new FetchTasksByCategoryUseCase(tasksRepository, categoriesRepository)

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to fetch tasks by category', async () => {
    await categoriesRepository.create({
      id: 'category-1',
      name: 'teste-1',
      user_id: 'user-1',
    })

    await categoriesRepository.create({
      id: 'category-2',
      name: 'teste-2',
      user_id: 'user-1',
    })

    await tasksRepository.create({
      title: 'Urgente',
      user_id: 'user-1',
      category_id: 'category-1',
    })

    await tasksRepository.create({
      title: 'Urgente 2',
      user_id: 'user-1',
      category_id: 'category-2',
    })

    await tasksRepository.create({
      title: 'Todo',
      user_id: 'user-1',
      category_id: 'category-1',
    })

    await tasksRepository.create({
      title: 'Urgente',
      user_id: 'user-2',
      category_id: 'category-1',
    })

    const { tasks } = await sut.execute({
      categoryId: 'category-1',
    })

    expect(tasks).toHaveLength(3)
  })

  it('should not be able to fetch tasks by category when categoryId is empty string', async () => {
    await expect(() =>
      sut.execute({
        categoryId: '',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to fetch tasks by category when category no exist.', async () => {
    await expect(() =>
      sut.execute({
        categoryId: 'category-1',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
