import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository.ts'
import { hash } from 'bcryptjs'
import { InMemoryTasksRepository } from '@/repositories/in-memory/in-memory-tasks-repository.ts'
import { DeleteTaskUseCase } from './delete-task.ts'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.ts'

let usersRepository: InMemoryUsersRepository
let tasksRepository: InMemoryTasksRepository
let sut: DeleteTaskUseCase

describe('Delete Task Use Case', () => {
  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository()
    tasksRepository = new InMemoryTasksRepository()
    sut = new DeleteTaskUseCase(usersRepository, tasksRepository)

    await usersRepository.create({
      id: 'user-1',
      name: 'John Doe',
      email: 'johndoe@example.com',
      password_hash: await hash('123456', 6),
    })

    await tasksRepository.create({
      id: 'task-1',
      title: 'Study JavaScript',
      description: 'Study JavaScript for Interview',
      status: 'TODO',
      priority: 'HIGH',
      due_date: new Date(),
      user_id: 'user-1',
      category_id: 'category-1',
      tags: {
        connect: { id: 'tag1.id' },
      },
    })
  })

  it('should be able to delete task', async () => {
    const { task } = await sut.execute({
      id: 'task-1',
      userId: 'user-1',
    })

    expect(task?.is_archived).toBe(true)
  })

  it('should not be able to delete task without user', async () => {
    await expect(() =>
      sut.execute({
        id: 'task-1',
        userId: 'nonexisting-user',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to delete task when task not exists.', async () => {
    await expect(() =>
      sut.execute({
        id: 'nonexisting-category',
        userId: 'user-1',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to delete task if task has created by other user', async () => {
    await usersRepository.create({
      id: 'user-2',
      name: 'Jane Doe',
      email: 'jane@example.com',
      password_hash: await hash('123456', 6),
    })

    await expect(() =>
      sut.execute({
        id: 'task-1',
        userId: 'user-2',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
