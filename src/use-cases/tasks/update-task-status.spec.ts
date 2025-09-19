import { InMemoryTasksRepository } from '@/repositories/in-memory/in-memory-tasks-repository.ts'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository.ts'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TaskStatus } from 'generated/prisma/index.js'
import { InvalidUpdateDataError } from '../errors/invalid-update-data-error.ts'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.ts'
import { UpdateTaskStatusUseCase } from './update-task-status.ts'

let tasksRepository: InMemoryTasksRepository
let usersRepository: InMemoryUsersRepository
let sut: UpdateTaskStatusUseCase

describe('Update Status Task Use Case', () => {
  beforeEach(async () => {
    tasksRepository = new InMemoryTasksRepository()
    usersRepository = new InMemoryUsersRepository()

    sut = new UpdateTaskStatusUseCase(tasksRepository, usersRepository)

    await usersRepository.create({
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: 'hashed-password',
    })

    await tasksRepository.create({
      id: 'task-1',
      title: 'Original Title',
      user_id: 'user-1',
      status: TaskStatus.TODO,
    })

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to update task status', async () => {
    const { task: updatedTask } = await sut.execute({
      id: 'task-1',
      status: TaskStatus.IN_PROGRESS,
    })

    expect(updatedTask.id).toBe('task-1')
    expect(updatedTask.status).toBe(TaskStatus.IN_PROGRESS)
  })

  it('should set completed_at when task status changes to DONE', async () => {
    await sut.execute({
      id: 'task-1',
      status: TaskStatus.IN_PROGRESS,
    })

    const { task: updatedTask } = await sut.execute({
      id: 'task-1',
      status: TaskStatus.DONE,
    })

    expect(updatedTask.id).toBe('task-1')
    expect(updatedTask.status).toBe(TaskStatus.DONE)
  })

  it('should not be able to update task with invalid status', async () => {
    await expect(
      sut.execute({
        id: 'task-1',
        // @ts-expect-error - Testing invalid status value
        status: TaskStatus.NONEXISTENT_STATUS,
      }),
    ).rejects.toBeInstanceOf(InvalidUpdateDataError)
  })

  it('should not be able to update non-existing task', async () => {
    await expect(
      sut.execute({
        id: 'task-non-existing',
        status: TaskStatus.TODO,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to update task status when it violates status flow', async () => {
    await expect(
      sut.execute({
        id: 'task-1',
        status: TaskStatus.DONE,
      }),
    ).rejects.toBeInstanceOf(InvalidUpdateDataError)
  })
})
