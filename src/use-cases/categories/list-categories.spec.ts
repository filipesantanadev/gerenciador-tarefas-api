import { beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryCategoriesRepository } from '@/repositories/in-memory/in-memory-categories-repository.ts'
import { ListCategoriesUseCase } from './list-categories.ts'
import { afterEach } from 'node:test'

let categoriesRepository: InMemoryCategoriesRepository
let sut: ListCategoriesUseCase

describe('List Categories Use Case', () => {
  beforeEach(() => {
    categoriesRepository = new InMemoryCategoriesRepository()
    sut = new ListCategoriesUseCase(categoriesRepository)

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to list user categories', async () => {
    const userId = 'user-123'

    vi.setSystemTime(new Date(2025, 11, 2, 8, 0, 0))
    await categoriesRepository.create({
      name: 'Work',
      color: '#3B82F6',
      userId,
    })

    vi.setSystemTime(new Date(2025, 11, 17, 8, 0, 0)) // 17.0
    await categoriesRepository.create({
      name: 'Personal',
      color: '#10B981',
      userId,
    })

    // Act: Listar categorias
    const { categories } = await sut.execute({
      userId,
    })

    // Assert
    expect(categories).toHaveLength(2)
    expect(categories[0]!.name).toBe('Personal')
    expect(categories[1]!.name).toBe('Work')
    expect(categories[0]!.userId).toBe(userId)
    expect(categories[1]!.userId).toBe(userId)
  })
})
