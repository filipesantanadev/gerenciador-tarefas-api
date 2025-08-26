import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository.ts'
import { hash } from 'bcryptjs'
import { UpdateCategoryUseCase } from './update-category.ts'
import { InMemoryCategoriesRepository } from '@/repositories/in-memory/in-memory-categories-repository.ts'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.ts'
import { InvalidUpdateDataError } from '../errors/invalid-update-data-error.ts'
import { CategoryAlreadyExistsError } from '../errors/category-already-exists-error.ts'

let usersRepository: InMemoryUsersRepository
let categoriesRepository: InMemoryCategoriesRepository
let sut: UpdateCategoryUseCase

describe('Update Category Use Case', () => {
  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository()
    categoriesRepository = new InMemoryCategoriesRepository()
    sut = new UpdateCategoryUseCase(categoriesRepository, usersRepository)
  })

  it('should be able to update category', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password_hash: await hash('123456', 6),
    })

    const category = await categoriesRepository.create({
      name: 'Work',
      user_id: user.id,
    })

    const updatedCategory = await sut.execute({
      id: category.id,
      description: 'Work test',
      userId: user.id,
    })

    expect(updatedCategory.category.id).toEqual(category.id)
    expect(updatedCategory.category.description).toEqual('Work test')
  })

  it('should be able to update all category fields', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password_hash: await hash('123456', 6),
    })

    const category = await categoriesRepository.create({
      name: 'Work',
      description: 'Old description',
      color: '#FF0000',
      icon: '📂',
      is_default: false,
      user_id: user.id,
    })

    const { category: updated } = await sut.execute({
      id: category.id,
      name: 'Updated Work',
      description: 'New description',
      color: '#0000FF',
      icon: '⭐',
      isDefault: true,
      userId: user.id,
    })

    expect(updated.name).toBe('Updated Work')
    expect(updated.description).toBe('New description')
    expect(updated.color).toBe('#0000FF')
    expect(updated.icon).toBe('⭐')
    expect(updated.is_default).toBe(true)
  })

  it('should not be able to update category when user does not exist', async () => {
    const userId = 'no-existing-user'

    const category = await categoriesRepository.create({
      name: 'Work',
      user_id: userId,
    })

    await expect(() =>
      sut.execute({
        id: category.id,
        description: 'Work test',
        userId,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to update a non-existing category', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password_hash: await hash('123456', 6),
    })

    await expect(() =>
      sut.execute({
        id: 'not-existing-id-category',
        description: 'Work test',
        userId: user.id,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not update a category when no fields are provided', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password_hash: await hash('123456', 6),
    })

    const category = await categoriesRepository.create({
      name: 'Work',
      description: 'Work category',
      color: '#FF0000',
      icon: '📂',
      is_default: false,
      user_id: user.id,
    })

    await expect(() =>
      sut.execute({
        id: category.id,
        userId: user.id,
      }),
    ).rejects.toBeInstanceOf(InvalidUpdateDataError)
  })

  it('should not update a category when same name category exists', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password_hash: await hash('123456', 6),
    })

    await categoriesRepository.create({
      name: 'Work',
      description: 'Work category',
      color: '#FF0000',
      icon: '📂',
      is_default: false,
      user_id: user.id,
    })

    const category = await categoriesRepository.create({
      name: 'Personal',
      description: 'Work category',
      color: '#fff',
      icon: '📂',
      is_default: true,
      user_id: user.id,
    })

    await expect(() =>
      sut.execute({
        id: category.id,
        name: 'Work',
        color: '#000',
        userId: user.id,
      }),
    ).rejects.toBeInstanceOf(CategoryAlreadyExistsError)
  })

  it('should not update a category that belongs to another user', async () => {
    const user1 = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password_hash: await hash('123456', 6),
    })

    const user2 = await usersRepository.create({
      name: 'Jane Doe',
      email: 'janedoe@example.com',
      password_hash: await hash('123456', 6),
    })

    const categoryFromUser1 = await categoriesRepository.create({
      name: 'Work',
      description: 'Work category',
      color: '#FF0000',
      icon: '📂',
      is_default: false,
      user_id: user1.id,
    })

    await expect(() =>
      sut.execute({
        id: categoryFromUser1.id,
        name: 'Updated Work',
        userId: user2.id,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
