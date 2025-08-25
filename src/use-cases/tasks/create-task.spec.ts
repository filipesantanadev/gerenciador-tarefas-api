import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository.ts'
import { InMemoryTasksRepository } from '@/repositories/in-memory/in-memory-tasks-repository.ts'
import { CreateTaskUseCase } from './create-task.ts'
import { InvalidCredentialsError } from '../errors/invalid-credentials-error.ts'

let tasksRepository: InMemoryTasksRepository
let usersRepository: InMemoryUsersRepository
let sut: CreateTaskUseCase

describe('Create Task Use Case', () => {
  beforeEach(() => {
    tasksRepository = new InMemoryTasksRepository()
    usersRepository = new InMemoryUsersRepository()
    sut = new CreateTaskUseCase(tasksRepository, usersRepository)
  })

  it('should be able to create a task', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: '123456',
    })

    const { task } = await sut.execute({
      title: 'Study JavaScript',
      description: 'Study JavaScript for Interview',
      status: 'TODO',
      priority: 'HIGH',
      dueDate: new Date(),
      userId: user.id,
      categoryId: 'category-1',
      tags: [],
    })

    expect(task.id).toEqual(expect.any(String))
    expect(task.title).toEqual('Study JavaScript')
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

  it('should not be able to create a task without user', async () => {
    await expect(() =>
      sut.execute({
        title: 'Study JavaScript',
        status: 'TODO',
        priority: 'HIGH',
        userId: 'not-existing-user',
        tags: [],
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })

  it('should create a task with null dueDate and completedAt if not provided', async () => {
    const user = await usersRepository.create({
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: '123456',
    })

    const { task } = await sut.execute({
      title: 'Task without dates',
      status: 'TODO',
      priority: 'MEDIUM',
      userId: user.id,
      tags: [],
    })

    expect(task.due_date).toBeNull()
    expect(task.completed_at).toBeNull()
  })
})
