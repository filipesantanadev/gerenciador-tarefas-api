import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ListTasksUseCase } from './list-tasks.ts'
import { InMemoryTasksRepository } from '@/repositories/in-memory/in-memory-tasks-repository.ts'

let tasksRepository: InMemoryTasksRepository
let sut: ListTasksUseCase

describe('List Tasks Use Case', () => {
  beforeEach(() => {
    tasksRepository = new InMemoryTasksRepository()
    sut = new ListTasksUseCase(tasksRepository)

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to list tasks', async () => {
    await tasksRepository.create({
      title: 'Urgente',
      user_id: 'user-1',
    })

    await tasksRepository.create({
      title: 'Urgente 2',
      user_id: 'user-1',
    })

    await tasksRepository.create({
      title: 'Todo',
      user_id: 'user-1',
    })

    await tasksRepository.create({
      title: 'Urgente',
      user_id: 'user-2',
    })

    const { tasks } = await sut.execute({
      userId: 'user-1',
      query: 'Urgent',
    })

    expect(tasks).toHaveLength(2)
  })

  it('should be able to return empty array when user has no tasks', async () => {
    const { tasks } = await sut.execute({
      userId: 'user-1',
    })

    expect(tasks).toHaveLength(0)
    expect(tasks).toEqual([])
  })

  it('should be able to return empty array when user does not exist', async () => {
    await tasksRepository.create({
      title: 'Task 1',
      user_id: 'user-1',
    })

    const { tasks } = await sut.execute({
      userId: 'nonexistent-user',
    })

    expect(tasks).toHaveLength(0)
  })

  it('should be able to filter tasks by status', async () => {
    await tasksRepository.create({
      title: 'Task 1',
      user_id: 'user-1',
      status: 'IN_PROGRESS',
    })

    await tasksRepository.create({
      title: 'Task 2',
      user_id: 'user-1',
      status: 'DONE',
    })

    await tasksRepository.create({
      title: 'Task 3',
      user_id: 'user-1',
      status: 'IN_PROGRESS',
    })

    const { tasks } = await sut.execute({
      userId: 'user-1',
      status: 'IN_PROGRESS',
    })

    expect(tasks).toHaveLength(2)
    expect(tasks[0]?.status).toBe('IN_PROGRESS')
    expect(tasks[1]?.status).toBe('IN_PROGRESS')
  })

  it('should be able to filter tasks by category', async () => {
    await tasksRepository.create({
      title: 'Task 1',
      user_id: 'user-1',
      category_id: 'category-1',
    })

    await tasksRepository.create({
      title: 'Task 2',
      user_id: 'user-1',
      category_id: 'category-2',
    })

    await tasksRepository.create({
      title: 'Task 3',
      user_id: 'user-1',
      category_id: 'category-1',
    })

    const { tasks } = await sut.execute({
      userId: 'user-1',
      categoryId: 'category-1',
    })

    expect(tasks).toHaveLength(2)
    expect(tasks[0]?.category_id).toBe('category-1')
    expect(tasks[1]?.category_id).toBe('category-1')
  })

  it('should be able to filter tasks by priority', async () => {
    await tasksRepository.create({
      title: 'Task 1',
      user_id: 'user-1',
      priority: 'HIGH',
    })

    await tasksRepository.create({
      title: 'Task 2',
      user_id: 'user-1',
      priority: 'LOW',
    })

    await tasksRepository.create({
      title: 'Task 3',
      user_id: 'user-1',
      priority: 'HIGH',
    })

    const { tasks } = await sut.execute({
      userId: 'user-1',
      priority: 'HIGH',
    })

    expect(tasks).toHaveLength(2)
    expect(tasks[0]?.priority).toBe('HIGH')
    expect(tasks[1]?.priority).toBe('HIGH')
  })

  it('should be able to filter tasks by due date', async () => {
    const today = new Date(2025, 4, 15, 8, 0, 0)
    vi.setSystemTime(today)

    const todayInLastMinutes = new Date(2025, 4, 15, 20, 59, 59)
    vi.setSystemTime(todayInLastMinutes)

    const tomorrow = new Date(2025, 4, 16, 8, 0, 0)
    vi.setSystemTime(tomorrow)

    await tasksRepository.create({
      title: 'Task Today',
      user_id: 'user-1',
      due_date: today,
    })

    await tasksRepository.create({
      title: 'Task Tomorrow',
      user_id: 'user-1',
      due_date: tomorrow,
    })

    await tasksRepository.create({
      title: 'Task Today 2',
      user_id: 'user-1',
      due_date: todayInLastMinutes,
    })

    const { tasks } = await sut.execute({
      userId: 'user-1',
      dueDate: today,
    })

    expect(tasks).toHaveLength(2)
    expect(
      tasks.every(
        (task) => task.due_date?.toISOString().split('T')[0] === '2025-05-15',
      ),
    ).toBe(true)
  })

  it('should be able to apply multiple filters together', async () => {
    await tasksRepository.create({
      title: 'Important Task',
      user_id: 'user-1',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      category_id: 'work',
    })

    await tasksRepository.create({
      title: 'Important Meeting',
      user_id: 'user-1',
      status: 'DONE',
      priority: 'HIGH',
      category_id: 'work',
    })

    await tasksRepository.create({
      title: 'Important Call',
      user_id: 'user-1',
      status: 'IN_PROGRESS',
      priority: 'LOW',
      category_id: 'work',
    })

    const { tasks } = await sut.execute({
      userId: 'user-1',
      query: 'Important',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      categoryId: 'work',
    })

    expect(tasks).toHaveLength(1)
    expect(tasks[0]?.title).toBe('Important Task')
    expect(tasks[0]?.status).toBe('IN_PROGRESS')
    expect(tasks[0]?.priority).toBe('HIGH')
  })

  it('should be able to handle pagination correctly', async () => {
    for (let i = 1; i <= 25; i++) {
      await tasksRepository.create({
        title: `Task ${i}`,
        user_id: 'user-1',
      })
    }

    // Primeira página (10 itens)
    const page1 = await sut.execute({
      userId: 'user-1',
      page: 1,
    })
    expect(page1.tasks).toHaveLength(10)

    // Segunda página (10 itens)
    const page2 = await sut.execute({
      userId: 'user-1',
      page: 2,
    })
    expect(page2.tasks).toHaveLength(10)

    // Terceira página (5 itens)
    const page3 = await sut.execute({
      userId: 'user-1',
      page: 3,
    })
    expect(page3.tasks).toHaveLength(5)

    // Página inexistente
    const page4 = await sut.execute({
      userId: 'user-1',
      page: 4,
    })
    expect(page4.tasks).toHaveLength(0)
  })

  it('should be able to handle exact page size boundary', async () => {
    for (let i = 1; i <= 20; i++) {
      await tasksRepository.create({
        title: `Task ${i}`,
        user_id: 'user-1',
      })
    }

    const page2 = await sut.execute({
      userId: 'user-1',
      page: 2,
    })

    expect(page2.tasks).toHaveLength(10)
  })

  it('should be able to case insensitive when searching by query', async () => {
    await tasksRepository.create({
      title: 'URGENT TASK',
      user_id: 'user-1',
    })

    await tasksRepository.create({
      title: 'urgent meeting',
      user_id: 'user-1',
    })

    await tasksRepository.create({
      title: 'Normal task',
      user_id: 'user-1',
    })

    const { tasks } = await sut.execute({
      userId: 'user-1',
      query: 'urgent',
    })

    expect(tasks).toHaveLength(2)
  })

  it('should be able to return empty array when no tasks match filters', async () => {
    await tasksRepository.create({
      title: 'Task 1',
      user_id: 'user-1',
      status: 'IN_PROGRESS',
      priority: 'LOW',
    })

    const { tasks } = await sut.execute({
      userId: 'user-1',
      status: 'DONE',
    })

    expect(tasks).toHaveLength(0)
  })

  it('should be able to return empty when query matches nothing', async () => {
    await tasksRepository.create({
      title: 'Work Task',
      user_id: 'user-1',
    })

    const { tasks } = await sut.execute({
      userId: 'user-1',
      query: 'xyz-nonexistent-term',
    })

    expect(tasks).toHaveLength(0)
  })

  it('should be able to handle undefined/null due_date correctly', async () => {
    await tasksRepository.create({
      title: 'Task without due date',
      user_id: 'user-1',
      due_date: null,
    })

    await tasksRepository.create({
      title: 'Task with due date',
      user_id: 'user-1',
      due_date: new Date('2024-03-15'),
    })

    const { tasks } = await sut.execute({
      userId: 'user-1',
      dueDate: new Date('2024-03-15'),
    })

    expect(tasks).toHaveLength(1)
    expect(tasks[0]?.title).toBe('Task with due date')
  })

  it('should be able to handle empty query string', async () => {
    await tasksRepository.create({
      title: 'Task 1',
      user_id: 'user-1',
    })

    await tasksRepository.create({
      title: 'Task 2',
      user_id: 'user-1',
    })

    const { tasks } = await sut.execute({
      userId: 'user-1',
      query: '',
    })

    expect(tasks).toHaveLength(2)
  })

  it('should be able to handle page 0 or negative page numbers', async () => {
    await tasksRepository.create({
      title: 'Task 1',
      user_id: 'user-1',
    })

    const { tasks } = await sut.execute({
      userId: 'user-1',
      page: 0,
    })

    expect(Array.isArray(tasks)).toBe(true)
    expect.arrayContaining([])
  })

  it('should list user tasks without archived ones by default', async () => {
    const userId = 'user-1'

    await tasksRepository.create({
      id: 'task-1',
      title: 'Task 1',
      status: 'TODO',
      priority: 'HIGH',
      user_id: userId,
      is_archived: false,
      created_at: new Date(),
      updated_at: new Date(),
    })

    await tasksRepository.create({
      id: 'task-2',
      title: 'Task 2',
      status: 'DONE',
      priority: 'LOW',
      user_id: userId,
      is_archived: false,
      created_at: new Date(),
      updated_at: new Date(),
    })

    await tasksRepository.create({
      id: 'task-3',
      title: 'Archived Task',
      status: 'DONE',
      priority: 'MEDIUM',
      user_id: userId,
      is_archived: true,
      created_at: new Date(),
      updated_at: new Date(),
    })

    const result = await sut.execute({ userId })

    expect(result.tasks).toHaveLength(2)
    expect(result.tasks.map((t) => t.id)).toEqual(['task-1', 'task-2'])
    expect(result.tasks.every((t) => !t.is_archived)).toBe(true)
  })
})
