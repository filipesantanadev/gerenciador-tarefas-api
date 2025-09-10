import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryTasksRepository } from '@/repositories/in-memory/in-memory-tasks-repository.ts'
import { FilterTasksUseCase } from './filter-tasks.ts'

let tasksRepository: InMemoryTasksRepository
let sut: FilterTasksUseCase

describe('Filter Tasks Use Case', () => {
  beforeEach(() => {
    tasksRepository = new InMemoryTasksRepository()
    sut = new FilterTasksUseCase(tasksRepository)

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to filter tasks', async () => {
    await tasksRepository.create({
      id: 'task-1',
      title: 'First Task',
      user_id: 'user-1',
      status: 'TODO',
      is_archived: false,
      created_at: new Date(),
    })

    await tasksRepository.create({
      id: 'task-2',
      title: 'Second Task',
      user_id: 'user-1',
      status: 'CANCELLED',
      is_archived: false,
      created_at: new Date(),
    })

    const { tasks } = await sut.execute({
      userId: 'user-1',
      status: 'TODO',
      page: 1,
    })

    expect(tasks).toHaveLength(1)
    expect(tasks).toEqual([
      expect.objectContaining({
        title: 'First Task',
      }),
    ])
  })

  it('should return empty array if no tasks match the filters', async () => {
    await tasksRepository.create({
      id: 'task-1',
      title: 'First Task',
      user_id: 'user-1',
      status: 'TODO',
      is_archived: false,
      created_at: new Date(),
    })

    const { tasks } = await sut.execute({
      userId: 'user-1',
      status: 'DONE',
      page: 1,
    })

    expect(tasks).toHaveLength(0)
    expect(tasks).toEqual([])
  })

  it('should be able to filter tasks by title', async () => {
    await tasksRepository.create({
      id: 'task-1',
      title: 'First Task',
      user_id: 'user-1',
      status: 'TODO',
      is_archived: false,
      created_at: new Date(),
    })

    await tasksRepository.create({
      id: 'task-2',
      title: 'Second Task',
      user_id: 'user-1',
      status: 'TODO',
      is_archived: false,
      created_at: new Date(),
    })

    const { tasks } = await sut.execute({
      userId: 'user-1',
      title: 'FIRST TASK',
      page: 1,
    })

    expect(tasks).toHaveLength(1)
    expect(tasks).toEqual([
      expect.objectContaining({
        title: 'First Task',
      }),
    ])
  })

  it('should be able to paginate the results', async () => {
    for (let i = 1; i <= 22; i++) {
      await tasksRepository.create({
        id: `task-${i}`,
        title: `Task ${i}`,
        user_id: 'user-1',
        is_archived: false,
        created_at: new Date(),
      })
    }

    const { tasks } = await sut.execute({
      userId: 'user-1',
      page: 2,
    })

    console.log({ tasks })

    expect(tasks).toHaveLength(2)
    expect(tasks[0]?.title).toEqual('Task 21')
    expect(tasks[1]?.title).toEqual('Task 22')
  })

  it('should not return archived tasks by default', async () => {
    await tasksRepository.create({
      id: 'task-1',
      title: 'Active Task',
      user_id: 'user-1',
      is_archived: false,
      created_at: new Date(),
    })

    await tasksRepository.create({
      id: 'task-2',
      title: 'Archived Task',
      user_id: 'user-1',
      is_archived: true,
      created_at: new Date(),
    })
    const { tasks } = await sut.execute({
      userId: 'user-1',
      page: 1,
    })

    expect(tasks).toHaveLength(1)
  })

  it('should be able to filter tasks by due date range', async () => {
    const today = new Date(2025, 11, 20, 10, 0, 0)
    const tomorrow = new Date(2025, 11, 20 + 1, 10, 0, 0)
    const dayAfterTomorrow = new Date(2025, 11, 20 + 2, 10, 0, 0)

    await tasksRepository.create({
      id: 'task-1',
      title: 'Task due today',
      user_id: 'user-1',
      due_date: today,
      is_archived: false,
      created_at: new Date(),
    })

    await tasksRepository.create({
      id: 'task-2',
      title: 'Task due tomorrow',
      user_id: 'user-1',
      due_date: tomorrow,
      is_archived: false,
      created_at: new Date(),
    })

    await tasksRepository.create({
      id: 'task-3',
      title: 'Task due day after tomorrow',
      user_id: 'user-1',
      due_date: dayAfterTomorrow,
      is_archived: false,
      created_at: new Date(),
    })

    const { tasks } = await sut.execute({
      userId: 'user-1',
      dueDateFrom: today,
      dueDateTo: tomorrow,
      page: 1,
    })

    expect(tasks).toHaveLength(2)
    expect(tasks).toEqual([
      expect.objectContaining({ title: 'Task due today' }),
      expect.objectContaining({ title: 'Task due tomorrow' }),
    ])
  })

  it('should be able to filter tasks by creation date range', async () => {
    const baseDate = new Date(2025, 11, 10, 10, 0, 0)
    const midDate = new Date(2025, 11, 15, 10, 0, 0)
    const laterDate = new Date(2025, 11, 30, 10, 0, 0)

    await tasksRepository.create({
      id: 'task-1',
      title: 'Early Task',
      user_id: 'user-1',
      is_archived: false,
      created_at: baseDate,
    })

    await tasksRepository.create({
      id: 'task-2',
      title: 'Mid Task',
      user_id: 'user-1',
      is_archived: false,
      created_at: midDate,
    })

    await tasksRepository.create({
      id: 'task-3',
      title: 'Later Task',
      user_id: 'user-1',
      is_archived: false,
      created_at: laterDate,
    })

    const { tasks } = await sut.execute({
      userId: 'user-1',
      createdAfter: new Date(2025, 11, 10 + 2, 10, 0, 0),
      createdBefore: new Date(2025, 11, 30 - 2, 10, 0, 0),
      page: 1,
    })

    expect(tasks).toHaveLength(1)
    expect(tasks).toEqual([expect.objectContaining({ title: 'Mid Task' })])
  })

  it('should be able to filter tasks by hasDescription', async () => {
    await tasksRepository.create({
      id: 'task-1',
      title: 'Task with description',
      user_id: 'user-1',
      description: 'This task has a description',
      is_archived: false,
      created_at: new Date(),
    })

    await tasksRepository.create({
      id: 'task-2',
      title: 'Task without description',
      user_id: 'user-1',
      description: null,
      is_archived: false,
      created_at: new Date(),
    })

    const { tasks: tasksWithDescription } = await sut.execute({
      userId: 'user-1',
      hasDescription: true,
      page: 1,
    })

    expect(tasksWithDescription).toHaveLength(1)
    expect(tasksWithDescription).toEqual([
      expect.objectContaining({ title: 'Task with description' }),
    ])

    const { tasks: tasksWithoutDescription } = await sut.execute({
      userId: 'user-1',
      hasDescription: false,
      page: 1,
    })

    expect(tasksWithoutDescription).toHaveLength(1)
    expect(tasksWithoutDescription).toEqual([
      expect.objectContaining({ title: 'Task without description' }),
    ])
  })

  it('should be able to filter overdue tasks', async () => {
    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - 1)
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 1)

    await tasksRepository.create({
      id: 'task-1',
      title: 'Overdue Task',
      user_id: 'user-1',
      due_date: pastDate,
      status: 'TODO',
      is_archived: false,
      created_at: new Date(),
    })

    await tasksRepository.create({
      id: 'task-2',
      title: 'Future Task',
      user_id: 'user-1',
      due_date: futureDate,
      status: 'TODO',
      is_archived: false,
      created_at: new Date(),
    })

    await tasksRepository.create({
      id: 'task-3',
      title: 'Completed Overdue Task',
      user_id: 'user-1',
      due_date: pastDate,
      status: 'DONE',
      is_archived: false,
      created_at: new Date(),
    })

    const { tasks } = await sut.execute({
      userId: 'user-1',
      overdue: true,
      page: 1,
    })

    expect(tasks).toHaveLength(1)
    expect(tasks).toEqual([expect.objectContaining({ title: 'Overdue Task' })])
  })

  it('should be able to paginate the results', async () => {
    for (let i = 1; i <= 22; i++) {
      await tasksRepository.create({
        id: `task-${i}`,
        title: `Task ${i}`,
        user_id: 'user-1',
        is_archived: false,
        created_at: new Date(),
      })
    }

    const { tasks } = await sut.execute({
      userId: 'user-1',
      page: 2,
    })

    expect(tasks).toHaveLength(2)
    expect(tasks[0]?.title).toEqual('Task 21')
    expect(tasks[1]?.title).toEqual('Task 22')
  })

  it('should be able to order tasks by title ascending', async () => {
    await tasksRepository.create({
      id: 'task-1',
      title: 'Zebra Task',
      user_id: 'user-1',
      is_archived: false,
      created_at: new Date(),
    })

    await tasksRepository.create({
      id: 'task-2',
      title: 'Alpha Task',
      user_id: 'user-1',
      is_archived: false,
      created_at: new Date(),
    })

    const { tasks } = await sut.execute({
      userId: 'user-1',
      orderBy: 'title',
      order: 'asc',
      page: 1,
    })

    expect(tasks[0]?.title).toEqual('Alpha Task')
    expect(tasks[1]?.title).toEqual('Zebra Task')
  })

  it('should be able to order tasks by created_at descending', async () => {
    const firstDate = new Date('2024-01-01')
    const secondDate = new Date('2024-01-02')

    await tasksRepository.create({
      id: 'task-1',
      title: 'First Task',
      user_id: 'user-1',
      is_archived: false,
      created_at: firstDate,
    })

    await tasksRepository.create({
      id: 'task-2',
      title: 'Second Task',
      user_id: 'user-1',
      is_archived: false,
      created_at: secondDate,
    })

    const { tasks } = await sut.execute({
      userId: 'user-1',
      orderBy: 'createdAt',
      order: 'desc',
      page: 1,
    })

    expect(tasks[0]?.title).toEqual('Second Task')
    expect(tasks[1]?.title).toEqual('First Task')
  })

  it('should be able to combine multiple filters', async () => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    await tasksRepository.create({
      id: 'task-1',
      title: 'Important Work Task',
      user_id: 'user-1',
      status: 'TODO',
      priority: 'HIGH',
      category_id: 'work',
      due_date: today,
      description: 'Important task',
      is_archived: false,
      created_at: new Date(),
    })

    await tasksRepository.create({
      id: 'task-2',
      title: 'Regular Personal Task',
      user_id: 'user-1',
      status: 'TODO',
      priority: 'LOW',
      category_id: 'personal',
      due_date: tomorrow,
      description: null,
      is_archived: false,
      created_at: new Date(),
    })

    const { tasks } = await sut.execute({
      userId: 'user-1',
      status: 'TODO',
      priority: 'HIGH',
      categoryId: 'work',
      hasDescription: true,
      page: 1,
    })

    expect(tasks).toHaveLength(1)
    expect(tasks).toEqual([
      expect.objectContaining({
        title: 'Important Work Task',
        priority: 'HIGH',
        category_id: 'work',
      }),
    ])
  })

  it('should return empty array when no tasks match combined filters', async () => {
    await tasksRepository.create({
      id: 'task-1',
      title: 'Work Task',
      user_id: 'user-1',
      status: 'TODO',
      priority: 'LOW',
      category_id: 'work',
      is_archived: false,
      created_at: new Date(),
    })

    const { tasks } = await sut.execute({
      userId: 'user-1',
      status: 'TODO',
      priority: 'HIGH', // Different priority
      categoryId: 'work',
      page: 1,
    })

    expect(tasks).toHaveLength(0)
  })
})
