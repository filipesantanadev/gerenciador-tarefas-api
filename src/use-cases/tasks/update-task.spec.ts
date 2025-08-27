import { InMemoryTasksRepository } from '@/repositories/in-memory/in-memory-tasks-repository.ts'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository.ts'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { UpdateTaskUseCase } from './update-task.ts'
import { Priority, TaskStatus } from 'generated/prisma/index.js'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.ts'
import { InvalidUpdateDataError } from '../errors/invalid-update-data-error.ts'
import { InMemoryTagsRepository } from '@/repositories/in-memory/in-memory-tags-repository.ts'
import { InMemoryCategoriesRepository } from '@/repositories/in-memory/in-memory-categories-repository.ts'

let tasksRepository: InMemoryTasksRepository
let usersRepository: InMemoryUsersRepository
let tagsRepository: InMemoryTagsRepository
let categoriesRepository: InMemoryCategoriesRepository
let sut: UpdateTaskUseCase

describe('Update Task Use Case', () => {
  beforeEach(async () => {
    tasksRepository = new InMemoryTasksRepository()
    usersRepository = new InMemoryUsersRepository()
    categoriesRepository = new InMemoryCategoriesRepository()
    tagsRepository = new InMemoryTagsRepository()
    sut = new UpdateTaskUseCase(
      tasksRepository,
      usersRepository,
      categoriesRepository,
      tagsRepository,
    )

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
    })

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to update task title', async () => {
    const { task: updatedTask } = await sut.execute({
      id: 'task-1',
      title: 'Updated Title',
      userId: 'user-1',
      categoryId: null,
      tags: [],
    })

    expect(updatedTask.title).toBe('Updated Title')
    expect(updatedTask.id).toBe('task-1')
  })

  it('should be able to update task description', async () => {
    const { task: updatedTask } = await sut.execute({
      id: 'task-1',
      description: 'Updated description',
      userId: 'user-1',
      categoryId: null,
      tags: [],
    })

    expect(updatedTask.description).toBe('Updated description')
  })

  it('should be able to update task status', async () => {
    const { task: updatedTask } = await sut.execute({
      id: 'task-1',
      status: TaskStatus.DONE,
      userId: 'user-1',
      categoryId: null,
      tags: [],
    })

    expect(updatedTask.status).toBe(TaskStatus.DONE)
  })

  it('should be able to update task priority', async () => {
    const { task: updatedTask } = await sut.execute({
      id: 'task-1',
      priority: Priority.URGENT,
      userId: 'user-1',
      categoryId: null,
      tags: [],
    })

    expect(updatedTask.priority).toBe(Priority.URGENT)
  })

  it('should be able to update task due date', async () => {
    const newDueDate = new Date('2024-12-31')

    const { task: updatedTask } = await sut.execute({
      id: 'task-1',
      dueDate: newDueDate,
      userId: 'user-1',
      categoryId: null,
      tags: [],
    })

    expect(updatedTask.due_date).toEqual(newDueDate)
  })

  it('should be able to update task completed_at', async () => {
    const completedAt = new Date('2024-03-15')

    const { task: updatedTask } = await sut.execute({
      id: 'task-1',
      completedAt,
      userId: 'user-1',
      categoryId: null,
      tags: [],
    })

    expect(updatedTask.completed_at).toEqual(completedAt)
  })

  it('should be able to archive task', async () => {
    const { task: updatedTask } = await sut.execute({
      id: 'task-1',
      isArchived: true,
      userId: 'user-1',
      categoryId: null,
      tags: [],
    })

    expect(updatedTask.is_archived).toBe(true)
  })

  it('should be able to unarchive task', async () => {
    const { task: updatedTask } = await sut.execute({
      id: 'task-1',
      isArchived: false,
      userId: 'user-1',
      categoryId: null,
      tags: [],
    })

    expect(updatedTask.is_archived).toBe(false)
  })

  it('should be able to update multiple fields at once', async () => {
    const category = await categoriesRepository.create({
      id: 'category-1',
      name: 'Work',
      user_id: 'user-1',
    })

    const tag = await tagsRepository.create({
      id: 'tag1',
      name: 'Urgent',
      creator: { connect: { id: 'user-1' } },
    })

    const newDueDate = new Date('2024-12-31')

    const { task: updatedTask } = await sut.execute({
      id: 'task-1',
      title: 'Updated Task',
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.HIGH,
      dueDate: newDueDate,
      userId: 'user-1',
      categoryId: category.id,
      tags: [{ id: tag.id }],
    })

    expect(updatedTask.title).toBe('Updated Task')
    expect(updatedTask.status).toBe(TaskStatus.IN_PROGRESS)
    expect(updatedTask.priority).toBe(Priority.HIGH)
    expect(updatedTask.due_date).toEqual(newDueDate)
  })

  it('should be able to set description to null', async () => {
    const { task: updatedTask } = await sut.execute({
      id: 'task-1',
      description: null,
      userId: 'user-1',
      categoryId: null,
      tags: [],
    })

    expect(updatedTask.description).toBeNull()
  })

  it('should be able to set due_date to null', async () => {
    const { task: updatedTask } = await sut.execute({
      id: 'task-1',
      dueDate: null,
      userId: 'user-1',
      categoryId: null,
      tags: [],
    })

    expect(updatedTask.due_date).toBeNull()
  })

  it('should be able to set completed_at to null', async () => {
    const { task: updatedTask } = await sut.execute({
      id: 'task-1',
      completedAt: null,
      userId: 'user-1',
      categoryId: null,
      tags: [],
    })

    expect(updatedTask.completed_at).toBeNull()
  })

  it('should not be able to update task if user does not exist', async () => {
    await expect(
      sut.execute({
        id: 'task-1',
        title: 'Updated Title',
        userId: 'nonexistent-user',
        categoryId: null,
        tags: [],
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to update task if task does not exist', async () => {
    await expect(
      sut.execute({
        id: 'nonexistent-task',
        title: 'Updated Title',
        userId: 'user-1',
        categoryId: null,
        tags: [],
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to update task from another user', async () => {
    const user2 = await usersRepository.create({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password_hash: 'hashed-password',
    })

    const task = await tasksRepository.create({
      title: 'John Task',
      user_id: 'user-1',
    })

    await expect(
      sut.execute({
        id: task.id,
        title: 'Updated Title',
        userId: user2.id,
        categoryId: null,
        tags: [],
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to update task with invalid status', async () => {
    await expect(
      sut.execute({
        id: 'task-1',
        status: 'INVALID_STATUS' as TaskStatus,
        userId: 'user-1',
        categoryId: null,
        tags: [],
      }),
    ).rejects.toBeInstanceOf(InvalidUpdateDataError)
  })

  it('should not be able to update task with invalid priority', async () => {
    await expect(
      sut.execute({
        id: 'task-1',
        priority: 'INVALID_PRIORITY' as Priority,
        userId: 'user-1',
        categoryId: null,
        tags: [],
      }),
    ).rejects.toBeInstanceOf(InvalidUpdateDataError)
  })

  it('should not be able to update task with no data provided', async () => {
    await expect(
      sut.execute({
        id: 'task-1',
        userId: 'user-1',
        categoryId: null,
        tags: [],
      }),
    ).rejects.toBeInstanceOf(InvalidUpdateDataError)
  })

  it('should not be able to update task with empty string title', async () => {
    await expect(() =>
      sut.execute({
        id: 'task-1',
        title: '',
        userId: 'user-1',
        categoryId: null,
        tags: [],
      }),
    ).rejects.toBeInstanceOf(InvalidUpdateDataError)
  })

  it('should update updated_at timestamp', async () => {
    const task = await tasksRepository.create({
      title: 'Task',
      user_id: 'user-1',
    })

    const originalUpdatedAt = task.updated_at

    vi.advanceTimersByTime(1000)

    const { task: updatedTask } = await sut.execute({
      id: task.id,
      title: 'Updated Task',
      userId: 'user-1',
      categoryId: null,
      tags: [],
    })

    expect(updatedTask.updated_at).not.toEqual(originalUpdatedAt)
    expect(updatedTask.updated_at.getTime()).toBeGreaterThan(
      originalUpdatedAt.getTime(),
    )
  })

  it('should be able to update to all valid task statuses', async () => {
    const statuses = [
      TaskStatus.TODO,
      TaskStatus.IN_PROGRESS,
      TaskStatus.DONE,
      TaskStatus.CANCELLED,
    ]

    for (const status of statuses) {
      const { task: updatedTask } = await sut.execute({
        id: 'task-1',
        status,
        userId: 'user-1',
        categoryId: null,
        tags: [],
      })

      expect(updatedTask.status).toBe(status)
    }
  })

  it('should be able to update to all valid priorities', async () => {
    const priorities = [
      Priority.LOW,
      Priority.MEDIUM,
      Priority.HIGH,
      Priority.URGENT,
    ]

    for (const priority of priorities) {
      const { task: updatedTask } = await sut.execute({
        id: 'task-1',
        priority,
        userId: 'user-1',
        categoryId: null,
        tags: [],
      })

      expect(updatedTask.priority).toBe(priority)
    }
  })

  it('should not allow updating a task with a category owned by another user, even if tags belong to the current user', async () => {
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

    const task = await tasksRepository.create({
      title: 'Study JavaScript',
      description: 'Study JavaScript for Interview',
      status: 'TODO',
      priority: 'HIGH',
      due_date: new Date(),
      user_id: user1.id,
      category_id: category.id,
      tags: {
        connect: [{ id: tag1.id }, { id: tag2.id }],
      },
    })

    await expect(() =>
      sut.execute({
        id: task.id,
        title: 'Study JavaScript',
        userId: user1.id,
        categoryId: category.id,
        tags: [{ id: tag1.id }, { id: tag2.id }],
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to update a task with correct category but tag id created by other user', async () => {
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

    const task = await tasksRepository.create({
      title: 'Study JavaScript',
      description: 'Study JavaScript for Interview',
      status: 'TODO',
      priority: 'HIGH',
      due_date: new Date(),
      user_id: user1.id,
      category_id: category.id,
      tags: {},
    })

    await expect(() =>
      sut.execute({
        id: task.id,
        title: 'Study JavaScript',
        userId: user1.id,
        categoryId: category.id,
        tags: [{ id: tag1.id }, { id: tag2.id }],
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
