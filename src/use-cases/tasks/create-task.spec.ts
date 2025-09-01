import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository.ts'
import { InMemoryTasksRepository } from '@/repositories/in-memory/in-memory-tasks-repository.ts'
import { CreateTaskUseCase } from './create-task.ts'
import { InvalidCredentialsError } from '../errors/invalid-credentials-error.ts'
import { InMemoryTagsRepository } from '@/repositories/in-memory/in-memory-tags-repository.ts'
import { InMemoryCategoriesRepository } from '@/repositories/in-memory/in-memory-categories-repository.ts'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.ts'
import { TitleIsRequiredError } from '../errors/title-is-required-error.ts'
import { UnauthorizedError } from '../errors/unauthorized-error.ts'

let tasksRepository: InMemoryTasksRepository
let usersRepository: InMemoryUsersRepository
let tagsRepository: InMemoryTagsRepository
let categoriesRepository: InMemoryCategoriesRepository
let sut: CreateTaskUseCase

describe('Create Task Use Case', () => {
  beforeEach(async () => {
    tasksRepository = new InMemoryTasksRepository()
    usersRepository = new InMemoryUsersRepository()
    categoriesRepository = new InMemoryCategoriesRepository()
    tagsRepository = new InMemoryTagsRepository()
    sut = new CreateTaskUseCase(
      tasksRepository,
      usersRepository,
      categoriesRepository,
      tagsRepository,
    )

    await usersRepository.create({
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: '123456',
    })

    await categoriesRepository.create({
      id: 'category-1',
      name: 'Work',
      user_id: 'user-1',
    })
  })

  it('should be able to create a task', async () => {
    const tag1 = await tagsRepository.create({
      id: 'tag1',
      name: 'Urgent',
      creator: { connect: { id: 'user-1' } },
    })

    const tag2 = await tagsRepository.create({
      id: 'tag2',
      name: 'Frontend',
      creator: { connect: { id: 'user-1' } },
    })

    const { task } = await sut.execute({
      title: 'Study JavaScript',
      description: 'Study JavaScript for Interview',
      status: 'TODO',
      priority: 'HIGH',
      dueDate: new Date(),
      userId: 'user-1',
      categoryId: 'category-1',
      tags: [{ id: tag1.id }, { id: tag2.id }],
    })

    expect(task.id).toEqual(expect.any(String))
    expect(task.title).toEqual('Study JavaScript')
  })

  it('should not allow creating a task with a category owned by another user even if tags are valid', async () => {
    const user1 = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: '123456',
    })

    const user2 = await usersRepository.create({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password_hash: '123456',
    })

    const category = await categoriesRepository.create({
      id: 'category-1',
      name: 'Work',
      user_id: user2.id,
    })

    const tag1 = await tagsRepository.create({
      id: 'tag1',
      name: 'Urgent',
      creator: { connect: { id: user1.id } },
    })
    const tag2 = await tagsRepository.create({
      id: 'tag2',
      name: 'Frontend',
      creator: { connect: { id: user1.id } },
    })

    await expect(() =>
      sut.execute({
        title: 'Study JavaScript',
        description: 'Study JavaScript for Interview',
        status: 'TODO',
        priority: 'HIGH',
        dueDate: new Date(),
        userId: user1.id,
        categoryId: category.id,
        tags: [{ id: tag1.id }, { id: tag2.id }],
      }),
    ).rejects.toBeInstanceOf(UnauthorizedError)
  })

  it('should not allow creating a task with tags owned by another user', async () => {
    const user1 = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: '123456',
    })

    const user2 = await usersRepository.create({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password_hash: '123456',
    })

    const category = await categoriesRepository.create({
      id: 'category-1',
      name: 'Work',
      user_id: user1.id,
    })

    const tag1 = await tagsRepository.create({
      id: 'tag1',
      name: 'Urgent',
      creator: { connect: { id: user2.id } },
    })
    const tag2 = await tagsRepository.create({
      id: 'tag2',
      name: 'Frontend',
      creator: { connect: { id: user2.id } },
    })

    await expect(() =>
      sut.execute({
        title: 'Study JavaScript',
        description: 'Study JavaScript for Interview',
        status: 'TODO',
        priority: 'HIGH',
        dueDate: new Date(),
        userId: user1.id,
        categoryId: category.id,
        tags: [{ id: tag1.id }, { id: tag2.id }],
      }),
    ).rejects.toBeInstanceOf(UnauthorizedError)
  })

  it('should set default values when optional fields are missing', async () => {
    const task = await tasksRepository.create({
      title: 'Task test',
      user_id: 'user-1',
    })

    expect(task.description).toBeNull()
    expect(task.status).toBe('TODO')
    expect(task.priority).toBe('MEDIUM')
    expect(task.due_date).toBeNull()
    expect(task.completed_at).toBeNull()
    expect(task.is_archived).toBe(false)
    expect(task.category_id).toBeNull()
  })

  it('should not be able to create a task without user', async () => {
    await expect(() =>
      sut.execute({
        title: 'Study JavaScript',
        description: 'Study JavaScript for Interview',
        status: 'TODO',
        priority: 'HIGH',
        dueDate: new Date(),
        userId: 'not-existing-user',
        categoryId: 'category-1',
        tags: [],
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })

  it('should create a task with null dueDate and completedAt if not provided', async () => {
    const { task } = await sut.execute({
      title: 'Task without dates',
      status: 'TODO',
      priority: 'MEDIUM',
      userId: 'user-1',
      tags: [],
    })

    expect(task.due_date).toBeNull()
    expect(task.completed_at).toBeNull()
  })

  it('should not allow creating a task if any tag does not exist', async () => {
    const tag1 = await tagsRepository.create({
      id: 'tag1',
      name: 'Urgent',
      creator: { connect: { id: 'user-1' } },
    })

    await expect(() =>
      sut.execute({
        title: 'Task with invalid tag',
        description: 'Test invalid tag',
        status: 'TODO',
        priority: 'HIGH',
        userId: 'user-1',
        categoryId: 'category-1',
        tags: [{ id: tag1.id }, { id: 'tag-does-not-exist' }],
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not allow creating a task if any tag belongs to another user', async () => {
    const otherUserTag = await tagsRepository.create({
      id: 'tag-other-user',
      name: 'OtherUserTag',
      creator: { connect: { id: 'user-2' } },
    })

    await expect(() =>
      sut.execute({
        title: 'Task with tag from another user',
        description: 'Test tag ownership',
        status: 'TODO',
        priority: 'HIGH',
        userId: 'user-1',
        categoryId: 'category-1',
        tags: [{ id: otherUserTag.id }],
      }),
    ).rejects.toBeInstanceOf(UnauthorizedError)
  })

  it('should not be able to create a task without title', async () => {
    await expect(() =>
      sut.execute({
        title: ' ',
        description: 'Study JavaScript for Interview',
        status: 'TODO',
        priority: 'HIGH',
        dueDate: new Date(),
        userId: 'user-1',
        categoryId: 'category-1',
        tags: [],
      }),
    ).rejects.toBeInstanceOf(TitleIsRequiredError)
  })
})
