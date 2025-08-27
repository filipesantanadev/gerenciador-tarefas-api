import { InMemoryTasksRepository } from '@/repositories/in-memory/in-memory-tasks-repository.ts'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository.ts'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { UpdateTaskUseCase } from './update-task.ts'
import { Priority, TaskStatus } from 'generated/prisma/index.js'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.ts'
import { InvalidUpdateDataError } from '../errors/invalid-update-data-error.ts'

let tasksRepository: InMemoryTasksRepository
let usersRepository: InMemoryUsersRepository
let sut: UpdateTaskUseCase

describe('Update Task Use Case', () => {
  beforeEach(() => {
    tasksRepository = new InMemoryTasksRepository()
    usersRepository = new InMemoryUsersRepository()
    sut = new UpdateTaskUseCase(tasksRepository, usersRepository)

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to update task title', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: 'hashed-password',
    })

    const task = await tasksRepository.create({
      title: 'Original Title',
      user_id: user.id,
    })

    const { task: updatedTask } = await sut.execute({
      id: task.id,
      title: 'Updated Title',
      userId: user.id,
    })

    expect(updatedTask.title).toBe('Updated Title')
    expect(updatedTask.id).toBe(task.id)
  })
  it('should be able to update task description', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: 'hashed-password',
    })

    const task = await tasksRepository.create({
      title: 'Task',
      user_id: user.id,
      description: 'Original description',
    })

    const { task: updatedTask } = await sut.execute({
      id: task.id,
      description: 'Updated description',
      userId: user.id,
    })

    expect(updatedTask.description).toBe('Updated description')
  })

  it('should be able to update task status', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: 'hashed-password',
    })

    const task = await tasksRepository.create({
      title: 'Task',
      user_id: user.id,
      status: TaskStatus.TODO,
    })

    const { task: updatedTask } = await sut.execute({
      id: task.id,
      status: TaskStatus.DONE,
      userId: user.id,
    })

    expect(updatedTask.status).toBe(TaskStatus.DONE)
  })

  it('should be able to update task priority', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: 'hashed-password',
    })

    const task = await tasksRepository.create({
      title: 'Task',
      user_id: user.id,
      priority: Priority.LOW,
    })

    const { task: updatedTask } = await sut.execute({
      id: task.id,
      priority: Priority.URGENT,
      userId: user.id,
    })

    expect(updatedTask.priority).toBe(Priority.URGENT)
  })

  it('should be able to update task due date', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: 'hashed-password',
    })

    const task = await tasksRepository.create({
      title: 'Task',
      user_id: user.id,
    })

    const newDueDate = new Date('2024-12-31')

    const { task: updatedTask } = await sut.execute({
      id: task.id,
      dueDate: newDueDate,
      userId: user.id,
    })

    expect(updatedTask.due_date).toEqual(newDueDate)
  })

  it('should be able to update task completed_at', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: 'hashed-password',
    })

    const task = await tasksRepository.create({
      title: 'Task',
      user_id: user.id,
    })

    const completedAt = new Date('2024-03-15')

    const { task: updatedTask } = await sut.execute({
      id: task.id,
      completedAt,
      userId: user.id,
    })

    expect(updatedTask.completed_at).toEqual(completedAt)
  })

  it('should be able to archive task', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: 'hashed-password',
    })

    const task = await tasksRepository.create({
      title: 'Task',
      user_id: user.id,
      is_archived: false,
    })

    const { task: updatedTask } = await sut.execute({
      id: task.id,
      isArchived: true,
      userId: user.id,
    })

    expect(updatedTask.is_archived).toBe(true)
  })

  it('should be able to unarchive task', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: 'hashed-password',
    })

    const task = await tasksRepository.create({
      title: 'Task',
      user_id: user.id,
      is_archived: true,
    })

    const { task: updatedTask } = await sut.execute({
      id: task.id,
      isArchived: false,
      userId: user.id,
    })

    expect(updatedTask.is_archived).toBe(false)
  })

  it('should be able to update multiple fields at once', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: 'hashed-password',
    })

    const task = await tasksRepository.create({
      title: 'Original Task',
      user_id: user.id,
      status: TaskStatus.TODO,
      priority: Priority.LOW,
    })

    const newDueDate = new Date('2024-12-31')

    const { task: updatedTask } = await sut.execute({
      id: task.id,
      title: 'Updated Task',
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.HIGH,
      dueDate: newDueDate,
      userId: user.id,
    })

    expect(updatedTask.title).toBe('Updated Task')
    expect(updatedTask.status).toBe(TaskStatus.IN_PROGRESS)
    expect(updatedTask.priority).toBe(Priority.HIGH)
    expect(updatedTask.due_date).toEqual(newDueDate)
  })

  it('should be able to set description to null', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: 'hashed-password',
    })

    const task = await tasksRepository.create({
      title: 'Task',
      user_id: user.id,
      description: 'Some description',
    })

    const { task: updatedTask } = await sut.execute({
      id: task.id,
      description: null,
      userId: user.id,
    })

    expect(updatedTask.description).toBeNull()
  })

  it('should be able to set due_date to null', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: 'hashed-password',
    })

    const task = await tasksRepository.create({
      title: 'Task',
      user_id: user.id,
      due_date: new Date('2024-12-31'),
    })

    const { task: updatedTask } = await sut.execute({
      id: task.id,
      dueDate: null,
      userId: user.id,
    })

    expect(updatedTask.due_date).toBeNull()
  })

  it('should be able to set completed_at to null', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: 'hashed-password',
    })

    const task = await tasksRepository.create({
      title: 'Task',
      user_id: user.id,
      completed_at: new Date('2024-03-15'),
    })

    const { task: updatedTask } = await sut.execute({
      id: task.id,
      completedAt: null,
      userId: user.id,
    })

    expect(updatedTask.completed_at).toBeNull()
  })

  it('should not be able to update task if user does not exist', async () => {
    await expect(
      sut.execute({
        id: 'task-1',
        title: 'Updated Title',
        userId: 'nonexistent-user',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to update task if task does not exist', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: 'hashed-password',
    })

    await expect(
      sut.execute({
        id: 'nonexistent-task',
        title: 'Updated Title',
        userId: user.id,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to update task from another user', async () => {
    const user1 = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: 'hashed-password',
    })

    const user2 = await usersRepository.create({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password_hash: 'hashed-password',
    })

    const task = await tasksRepository.create({
      title: 'John Task',
      user_id: user1.id,
    })

    await expect(
      sut.execute({
        id: task.id,
        title: 'Updated Title',
        userId: user2.id,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to update task with invalid status', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: 'hashed-password',
    })

    const task = await tasksRepository.create({
      title: 'Task',
      user_id: user.id,
    })

    await expect(
      sut.execute({
        id: task.id,
        status: 'INVALID_STATUS' as TaskStatus,
        userId: user.id,
      }),
    ).rejects.toBeInstanceOf(InvalidUpdateDataError)
  })

  it('should not be able to update task with invalid priority', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: 'hashed-password',
    })

    const task = await tasksRepository.create({
      title: 'Task',
      user_id: user.id,
    })

    await expect(
      sut.execute({
        id: task.id,
        priority: 'INVALID_PRIORITY' as Priority,
        userId: user.id,
      }),
    ).rejects.toBeInstanceOf(InvalidUpdateDataError)
  })

  it('should not be able to update task with no data provided', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: 'hashed-password',
    })

    const task = await tasksRepository.create({
      title: 'Task',
      user_id: user.id,
    })

    await expect(
      sut.execute({
        id: task.id,
        userId: user.id,
      }),
    ).rejects.toBeInstanceOf(InvalidUpdateDataError)
  })

  it('should be able to update task with empty string title', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: 'hashed-password',
    })

    const task = await tasksRepository.create({
      title: 'Original Task',
      user_id: user.id,
    })

    const { task: updatedTask } = await sut.execute({
      id: task.id,
      title: '',
      description: 'New description',
      userId: user.id,
    })

    expect(updatedTask.title).toBe('Original Task')
    expect(updatedTask.description).toBe('New description')
  })

  it('should update updated_at timestamp', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: 'hashed-password',
    })

    const task = await tasksRepository.create({
      title: 'Task',
      user_id: user.id,
    })

    const originalUpdatedAt = task.updated_at

    vi.advanceTimersByTime(1000)

    const { task: updatedTask } = await sut.execute({
      id: task.id,
      title: 'Updated Task',
      userId: user.id,
    })

    expect(updatedTask.updated_at).not.toEqual(originalUpdatedAt)
    expect(updatedTask.updated_at.getTime()).toBeGreaterThan(
      originalUpdatedAt.getTime(),
    )
  })

  it('should be able to update to all valid task statuses', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: 'hashed-password',
    })

    const task = await tasksRepository.create({
      title: 'Task',
      user_id: user.id,
    })

    const statuses = [
      TaskStatus.TODO,
      TaskStatus.IN_PROGRESS,
      TaskStatus.DONE,
      TaskStatus.CANCELLED,
    ]

    for (const status of statuses) {
      const { task: updatedTask } = await sut.execute({
        id: task.id,
        status,
        userId: user.id,
      })

      expect(updatedTask.status).toBe(status)
    }
  })

  it('should be able to update to all valid priorities', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: 'hashed-password',
    })

    const task = await tasksRepository.create({
      title: 'Task',
      user_id: user.id,
    })

    const priorities = [
      Priority.LOW,
      Priority.MEDIUM,
      Priority.HIGH,
      Priority.URGENT,
    ]

    for (const priority of priorities) {
      const { task: updatedTask } = await sut.execute({
        id: task.id,
        priority,
        userId: user.id,
      })

      expect(updatedTask.priority).toBe(priority)
    }
  })
})
