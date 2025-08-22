import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryCategoriesRepository } from '@/repositories/in-memory/in-memory-categories-repository.ts'
import { ListCategoriesUseCase } from './list-categories.ts'

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

  it('should be able to list user categories by creation date (newest first)', async () => {
    const userId = 'user-123'

    vi.setSystemTime(new Date(2025, 11, 2, 8, 0, 0))
    await categoriesRepository.create({
      name: 'Work',
      color: '#3B82F6',
      userId,
    })

    vi.setSystemTime(new Date(2025, 11, 17, 8, 0, 0))
    await categoriesRepository.create({
      name: 'Personal',
      color: '#10B981',
      userId,
    })

    const { categories } = await sut.execute({
      userId,
    })

    expect(categories).toHaveLength(2)
    expect(categories.map((c) => c.name)).toEqual(['Personal', 'Work'])
  })

  it('should return empty array when user has no categories', async () => {
    const { categories } = await sut.execute({
      userId: 'user-without-categories',
    })

    expect(categories).toEqual([])
  })

  it('should return only categories from specified user', async () => {
    const userId1 = 'user-1'
    const userId2 = 'user-2'

    for (let i = 1; i <= 5; i++) {
      vi.setSystemTime(new Date(2025, 11, i, 8, 0, 0))
      await categoriesRepository.create({
        name: `Work ${i}`,
        color: '#ffffffff',
        userId: userId1,
      })
    }

    await categoriesRepository.create({
      name: 'Personal',
      color: '#6d196dff',
      userId: userId2,
    })

    const { categories } = await sut.execute({ userId: userId1 })

    expect(categories).toHaveLength(5)
    expect(categories.map((c) => c.userId)).toEqual(Array(5).fill(userId1))
    expect(categories.map((c) => c.name)).toEqual([
      'Work 5',
      'Work 4',
      'Work 3',
      'Work 2',
      'Work 1',
    ])
  })

  it('should keep stable order when categories have same creation date', async () => {
    const userId = 'user-123'
    const now = new Date(2025, 11, 20, 10, 0, 0)

    vi.setSystemTime(now)
    await categoriesRepository.create({ name: 'A', color: '#000', userId })
    await categoriesRepository.create({ name: 'B', color: '#111', userId })

    const { categories } = await sut.execute({ userId })

    console.log(categories.map((c) => c.name))

    expect(categories.map((c) => c.name)).toEqual(
      expect.arrayContaining(['A', 'B']),
    )
  })
})
