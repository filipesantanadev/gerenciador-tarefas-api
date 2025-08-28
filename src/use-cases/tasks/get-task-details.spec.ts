import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryTasksRepository } from '@/repositories/in-memory/in-memory-tasks-repository.ts'
import { GetTaskDetailsUseCase } from './get-task-details.ts'
import { InvalidCredentialsError } from '../errors/invalid-credentials-error.ts'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.ts'

let taskRepository: InMemoryTasksRepository
let sut: GetTaskDetailsUseCase

describe('Get Task Details Use Case', () => {
  beforeEach(async () => {
    taskRepository = new InMemoryTasksRepository()
    sut = new GetTaskDetailsUseCase(taskRepository)

    await taskRepository.create({
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

  it('should be able to get task details', async () => {
    const { task } = await sut.execute({
      id: 'task-1',
      userId: 'user-1',
    })

    expect(task.id).toEqual(expect.any(String))
    expect(task.title).toEqual('Study JavaScript')
    expect(task.user_id).toEqual('user-1')
  })

  it('should be not be able to get task details with wrong task id', async () => {
    await expect(() =>
      sut.execute({
        id: 'not-existing-id',
        userId: 'user-1',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should be not be able to get task details with wrong user id', async () => {
    await expect(() =>
      sut.execute({
        id: 'task-1',
        userId: 'user-2',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })

  it('should not be able to get task details when user does not exist', async () => {
    await expect(() =>
      sut.execute({
        id: 'task-1',
        userId: 'non-existing-user',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })
})
