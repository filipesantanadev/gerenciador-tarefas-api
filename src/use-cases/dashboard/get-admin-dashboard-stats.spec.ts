import { beforeEach, describe, expect, it } from 'vitest'
import { GetAdminDashboardStatsUseCase } from './get-admin-dashboard-stats.ts'
import { InMemoryTasksRepository } from '@/repositories/in-memory/in-memory-tasks-repository.ts'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository.ts'
import { hash } from 'bcryptjs'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.ts'

let tasksRepository: InMemoryTasksRepository
let usersRepository: InMemoryUsersRepository
let sut: GetAdminDashboardStatsUseCase

describe('Get Admin Dashboard Stats Use Case', () => {
  beforeEach(() => {
    tasksRepository = new InMemoryTasksRepository()
    usersRepository = new InMemoryUsersRepository()
    sut = new GetAdminDashboardStatsUseCase(tasksRepository, usersRepository)
  })

  it('should get global statistics for all users', async () => {
    const user1 = await usersRepository.create({
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
    })

    const user2 = await usersRepository.create({
      id: 'user-2',
      name: 'Jane Doe',
      email: 'jane@example.com',
      password_hash: await hash('123456', 6),
    })

    await tasksRepository.create({
      title: 'User 1 Task TODO',
      status: 'TODO',
      priority: 'HIGH',
      user_id: user1.id,
    })

    await tasksRepository.create({
      title: 'User 1 Task DONE',
      status: 'DONE',
      priority: 'MEDIUM',
      user_id: user1.id,
    })

    await tasksRepository.create({
      title: 'User 2 Task IN_PROGRESS',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      user_id: user2.id,
    })

    await tasksRepository.create({
      title: 'User 2 Task CANCELLED',
      status: 'CANCELLED',
      priority: 'LOW',
      user_id: user2.id,
    })

    const { stats } = await sut.execute({})

    expect(stats.totalTasks).toBe(4)
    expect(stats.tasksByStatus.todo).toBe(1)
    expect(stats.tasksByStatus.inProgress).toBe(1)
    expect(stats.tasksByStatus.done).toBe(1)
    expect(stats.tasksByStatus.cancelled).toBe(1)
    expect(stats.completionRate).toBe(25)
  })

  it('should get statistics for specific user by email', async () => {
    const user1 = await usersRepository.create({
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
    })

    const user2 = await usersRepository.create({
      id: 'user-2',
      name: 'Jane Doe',
      email: 'jane@example.com',
      password_hash: await hash('123456', 6),
    })

    await tasksRepository.create({
      title: 'User 1 Task 1',
      status: 'TODO',
      priority: 'HIGH',
      user_id: user1.id,
    })

    await tasksRepository.create({
      title: 'User 1 Task 2',
      status: 'DONE',
      priority: 'MEDIUM',
      user_id: user1.id,
    })

    await tasksRepository.create({
      title: 'User 2 Task',
      status: 'TODO',
      priority: 'HIGH',
      user_id: user2.id,
    })

    const { stats, user } = await sut.execute({
      targetUserEmail: 'john@example.com',
    })

    expect(stats.totalTasks).toBe(2)
    expect(stats.tasksByStatus.todo).toBe(1)
    expect(stats.tasksByStatus.done).toBe(1)
    expect(stats.completionRate).toBe(50)

    expect(user).toBeDefined()
    expect(user?.id).toBe(user1.id)
    expect(user?.name).toBe('John Doe')
    expect(user?.email).toBe('john@example.com')
  })

  it('should throw error when user email not found', async () => {
    await expect(() =>
      sut.execute({
        targetUserEmail: 'nonexistent@example.com',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should calculate overdue tasks correctly for all users', async () => {
    const user = await usersRepository.create({
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
    })

    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - 5)

    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 5)

    await tasksRepository.create({
      title: 'Overdue Task',
      status: 'TODO',
      priority: 'HIGH',
      due_date: pastDate,
      user_id: user.id,
    })

    await tasksRepository.create({
      title: 'Future Task',
      status: 'TODO',
      priority: 'MEDIUM',
      due_date: futureDate,
      user_id: user.id,
    })

    await tasksRepository.create({
      title: 'Overdue but Done',
      status: 'DONE',
      priority: 'HIGH',
      due_date: pastDate,
      user_id: user.id,
    })

    const { stats } = await sut.execute({})

    expect(stats.overdueTasks).toBe(1)
    expect(stats.totalTasks).toBe(3)
  })

  it('should return zero stats when no tasks exist', async () => {
    const { stats } = await sut.execute({})

    expect(stats.totalTasks).toBe(0)
    expect(stats.tasksByStatus.todo).toBe(0)
    expect(stats.tasksByStatus.inProgress).toBe(0)
    expect(stats.tasksByStatus.done).toBe(0)
    expect(stats.tasksByStatus.cancelled).toBe(0)
    expect(stats.overdueTasks).toBe(0)
    expect(stats.completionRate).toBe(0)
  })

  it('should return zero stats for user with no tasks', async () => {
    await usersRepository.create({
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
    })

    const { stats, user } = await sut.execute({
      targetUserEmail: 'john@example.com',
    })

    expect(stats.totalTasks).toBe(0)
    expect(user?.email).toBe('john@example.com')
  })
})
