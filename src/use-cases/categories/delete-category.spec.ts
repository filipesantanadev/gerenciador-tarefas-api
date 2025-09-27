import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository.ts'
import { hash } from 'bcryptjs'
import { InMemoryCategoriesRepository } from '@/repositories/in-memory/in-memory-categories-repository.ts'
import { DeleteCategoryUseCase } from './delete-category.ts'
import { InMemoryTasksRepository } from '@/repositories/in-memory/in-memory-tasks-repository.ts'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.ts'
import { UnauthorizedError } from '../errors/unauthorized-error.ts'

let usersRepository: InMemoryUsersRepository
let categoriesRepository: InMemoryCategoriesRepository
let tasksRepository: InMemoryTasksRepository
let sut: DeleteCategoryUseCase

describe('Delete Category Use Case', () => {
  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository()
    categoriesRepository = new InMemoryCategoriesRepository()
    tasksRepository = new InMemoryTasksRepository()
    sut = new DeleteCategoryUseCase(
      categoriesRepository,
      usersRepository,
      tasksRepository,
    )

    await usersRepository.create({
      id: 'user-1',
      name: 'John Doe',
      email: 'johndoe@example.com',
      password_hash: await hash('123456', 6),
    })

    await categoriesRepository.create({
      id: 'category-1',
      name: 'Work',
      user_id: 'user-1',
    })
  })

  it('should be able to delete category', async () => {
    await sut.execute({
      id: 'category-1',
      userId: 'user-1',
    })

    const category = await categoriesRepository.findById('category-1')
    expect(category).toBeNull()
  })

  it('should not be able to delete category without user', async () => {
    await expect(() =>
      sut.execute({
        id: 'category-1',
        userId: 'nonexisting-user',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to delete category if category no exists', async () => {
    await expect(() =>
      sut.execute({
        id: 'nonexisting-category',
        userId: 'user-1',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to delete category if category has created by other user', async () => {
    await usersRepository.create({
      id: 'user-2',
      name: 'Jane Doe',
      email: 'jane@example.com',
      password_hash: await hash('123456', 6),
    })

    await expect(() =>
      sut.execute({
        id: 'category-1',
        userId: 'user-2',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedError)
  })

  it('should delete category and reassign tasks to uncategorized when category has tasks', async () => {
    await tasksRepository.create({
      id: 'task-1',
      title: 'Study JavaScript',
      description: 'Study JavaScript for Interview',
      status: 'TODO',
      priority: 'HIGH',
      due_date: new Date(),
      user_id: 'user-1',
      category_id: 'category-1',
    })

    await tasksRepository.create({
      id: 'task-2',
      title: 'Study React',
      description: 'Study React for Interview',
      status: 'IN_PROGRESS',
      priority: 'URGENT',
      due_date: new Date(),
      user_id: 'user-1',
      category_id: 'category-1',
    })

    await sut.execute({
      id: 'category-1',
      userId: 'user-1',
    })

    const tasksAfterDeletion = await tasksRepository.findManyByCategoryId(
      'category-1',
      1,
    )
    expect(tasksAfterDeletion).toEqual([])
  })
})
