import { beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository.ts'
import { InMemoryTasksRepository } from '@/repositories/in-memory/in-memory-tasks-repository.ts'
import { RemoveTagFromTaskUseCase } from './remove-tag-from-task.ts'
import { InvalidCredentialsError } from '../errors/invalid-credentials-error.ts'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.ts'
import { UnauthorizedError } from '../errors/unauthorized-error.ts'

let tasksRepository: InMemoryTasksRepository
let usersRepository: InMemoryUsersRepository
let sut: RemoveTagFromTaskUseCase

describe('Add Tag to Task Use Case', () => {
  beforeEach(async () => {
    tasksRepository = new InMemoryTasksRepository()
    usersRepository = new InMemoryUsersRepository()
    sut = new RemoveTagFromTaskUseCase(tasksRepository, usersRepository)

    await usersRepository.create({
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: '123456',
    })
  })

  it('should be able to remove tag from task', async () => {
    const task = await tasksRepository.create({
      id: 'task-1',
      title: 'Study JavaScript',
      description: 'Study JavaScript for Interview',
      status: 'TODO',
      priority: 'HIGH',
      due_date: new Date(),
      user_id: 'user-1',
      category_id: 'category-1',
      tags: { create: { id: 'tag-1', name: 'Bug' } },
    })

    const result = await sut.execute({
      taskId: 'task-1',
      userId: 'user-1',
      tagId: 'tag-1',
    })
    expect(result).toBeDefined()
    expect(result.task.id).toBe(task.id)
  })

  it('should not be able to remove tag from task with invalid user', async () => {
    await tasksRepository.create({
      id: 'task-1',
      title: 'Study JavaScript',
      description: 'Study JavaScript for Interview',
      status: 'TODO',
      priority: 'HIGH',
      due_date: new Date(),
      user_id: 'user-1',
      category_id: 'category-1',
      tags: { create: { id: 'tag-1', name: 'Bug' } },
    })

    await expect(() =>
      sut.execute({
        taskId: 'task-1',
        userId: 'user-2',
        tagId: 'tag-1',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })

  it('should not be able to remove tag from task if task not exist', async () => {
    await expect(() =>
      sut.execute({
        taskId: 'non-existing-task',
        userId: 'user-1',
        tagId: 'tag-1',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to remove tag from task if task not belongs my user', async () => {
    await usersRepository.create({
      id: 'user-2',
      name: 'Jane Doe',
      email: 'jane@example.com',
      password_hash: '123456',
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
      tags: { create: { id: 'tag-1', name: 'Bug' } },
    })

    await expect(() =>
      sut.execute({
        taskId: 'task-1',
        userId: 'user-2',
        tagId: 'any-tag-id',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedError)
  })

  it('should not be able to remove tag if removeTag returns null.', async () => {
    const task = await tasksRepository.create({
      title: 'Test Task',
      description: 'Test Description',
      user_id: 'user-1',
      status: 'TODO',
      priority: 'MEDIUM',
      due_date: null,
      category_id: null,
      tags: { create: { id: 'tag-1', name: 'Bug' } },
    })

    vi.spyOn(tasksRepository, 'removeTag').mockResolvedValueOnce(null)

    await expect(
      sut.execute({
        taskId: task.id,
        userId: 'user-1',
        tagId: 'tag-1',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
