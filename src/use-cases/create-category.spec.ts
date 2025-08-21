import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryCategoriesRepository } from '@/repositories/in-memory/in-memory-categories-repository.ts'
import { CreateCategoryUseCase } from './create-category.ts'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository.ts'
import { CategoryAlreadyExistsError } from './errors/category-already-exists-error.ts'
import { InvalidCredentialsError } from './errors/invalid-credentials-error.ts'

let categoriesRepository: InMemoryCategoriesRepository
let usersRepository: InMemoryUsersRepository
let sut: CreateCategoryUseCase

describe('Create Category Use Case', () => {
  beforeEach(() => {
    categoriesRepository = new InMemoryCategoriesRepository()
    usersRepository = new InMemoryUsersRepository()
    sut = new CreateCategoryUseCase(categoriesRepository, usersRepository)
  })

  it('should not be able to create a category for non-existing user', async () => {
    await expect(() =>
      sut.execute({
        name: 'Work',
        userId: 'non-existing-user-id',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })

  it('should be able to create a category', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: '123456',
    })

    const { category } = await sut.execute({
      name: 'Work',
      userId: user.id,
    })

    expect(category.id).toEqual(expect.any(String))
    expect(category.name).toBe('Work')
    expect(category.userId).toBe(user.id)
    expect(category.color).toBe('#3B82F6') // default
    expect(category.isDefault).toBe(false) // default
  })

  it('should not be able to creata a category with same name twice', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: '123456',
    })

    await sut.execute({
      name: 'Work',
      userId: user.id,
    })

    await expect(() =>
      sut.execute({
        name: 'Work',
        userId: user.id,
      }),
    ).rejects.toBeInstanceOf(CategoryAlreadyExistsError)
  })
})
