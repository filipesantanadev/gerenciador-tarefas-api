import { InMemoryTasksRepository } from '@/repositories/in-memory/in-memory-tasks-repository.ts'
import { GetDashboardStatsUseCase } from './get-dashboard-stats.ts'
import { beforeEach, describe, expect, it } from 'vitest'

let tasksRepository: InMemoryTasksRepository
let sut: GetDashboardStatsUseCase

describe('Get Dashboard Stats Use Case', () => {
  beforeEach(() => {
    tasksRepository = new InMemoryTasksRepository()
    sut = new GetDashboardStatsUseCase(tasksRepository)
  })

  it('should return dashboard statistics for user', async () => {
    const userId = 'user-1'

    await tasksRepository.create({
      title: 'Task TODO',
      status: 'TODO',
      priority: 'HIGH',
      user_id: userId,
    })

    await tasksRepository.create({
      title: 'Task In Progress',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      user_id: userId,
    })

    await tasksRepository.create({
      title: 'Task Done',
      status: 'DONE',
      priority: 'LOW',
      user_id: userId,
    })

    await tasksRepository.create({
      title: 'Task Cancelled',
      status: 'CANCELLED',
      priority: 'MEDIUM',
      user_id: userId,
    })

    const stats = await sut.execute({ userId })

    expect(stats.totalTasks).toBe(4)
    expect(stats.tasksByStatus.todo).toBe(1)
    expect(stats.tasksByStatus.inProgress).toBe(1)
    expect(stats.tasksByStatus.done).toBe(1)
    expect(stats.tasksByStatus.cancelled).toBe(1)
    expect(stats.completionRate).toBe(25)
  })

  it('should calculate overdue tasks correctly', async () => {
    const userId = 'user-1'
    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - 5)

    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 5)

    await tasksRepository.create({
      title: 'Overdue Task',
      status: 'TODO',
      priority: 'HIGH',
      due_date: pastDate,
      user_id: userId,
    })

    await tasksRepository.create({
      title: 'Future Task',
      status: 'TODO',
      priority: 'MEDIUM',
      due_date: futureDate,
      user_id: userId,
    })

    await tasksRepository.create({
      title: 'Overdue but Done',
      status: 'DONE',
      priority: 'HIGH',
      due_date: pastDate,
      user_id: userId,
    })

    const stats = await sut.execute({ userId })

    expect(stats.overdueTasks).toBe(1)
    expect(stats.totalTasks).toBe(3)
  })

  it('should return zero stats when user has no tasks', async () => {
    const stats = await sut.execute({ userId: 'user-without-tasks' })

    expect(stats.totalTasks).toBe(0)
    expect(stats.tasksByStatus.todo).toBe(0)
    expect(stats.tasksByStatus.inProgress).toBe(0)
    expect(stats.tasksByStatus.done).toBe(0)
    expect(stats.tasksByStatus.cancelled).toBe(0)
    expect(stats.overdueTasks).toBe(0)
    expect(stats.completionRate).toBe(0)
  })

  it('should calculate 100% completion rate when all tasks are done', async () => {
    const userId = 'user-1'

    await tasksRepository.create({
      title: 'Task 1',
      status: 'DONE',
      priority: 'HIGH',
      user_id: userId,
    })

    await tasksRepository.create({
      title: 'Task 2',
      status: 'DONE',
      priority: 'MEDIUM',
      user_id: userId,
    })

    const stats = await sut.execute({ userId })

    expect(stats.completionRate).toBe(100)
    expect(stats.totalTasks).toBe(2)
    expect(stats.tasksByStatus.done).toBe(2)
  })

  it('should only count tasks from specific user', async () => {
    await tasksRepository.create({
      title: 'User 1 Task',
      status: 'TODO',
      priority: 'HIGH',
      user_id: 'user-1',
    })

    await tasksRepository.create({
      title: 'User 2 Task',
      status: 'DONE',
      priority: 'HIGH',
      user_id: 'user-2',
    })

    const stats = await sut.execute({ userId: 'user-1' })

    expect(stats.totalTasks).toBe(1)
    expect(stats.tasksByStatus.todo).toBe(1)
    expect(stats.tasksByStatus.done).toBe(0)
  })

  it('should not count cancelled tasks as overdue', async () => {
    const userId = 'user-1'
    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - 5)

    await tasksRepository.create({
      title: 'Cancelled Overdue Task',
      status: 'CANCELLED',
      priority: 'HIGH',
      due_date: pastDate,
      user_id: userId,
    })

    const stats = await sut.execute({ userId })

    expect(stats.overdueTasks).toBe(0)
    expect(stats.tasksByStatus.cancelled).toBe(1)
  })
})
