import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryTasksRepository } from '@/repositories/in-memory/in-memory-tasks-repository.ts'
import { SearchTasksUseCase } from './search-tasks.ts'

let tasksRepository: InMemoryTasksRepository
let sut: SearchTasksUseCase

describe('Search Tasks Use Case', () => {
  beforeEach(() => {
    tasksRepository = new InMemoryTasksRepository()
    sut = new SearchTasksUseCase(tasksRepository)
  })

  it('should be able to search tasks', async () => {
    await tasksRepository.create({
      id: 'task-1',
      title: 'First Task',
      user_id: 'user-1',
      is_archived: false,
      created_at: new Date(),
    })

    await tasksRepository.create({
      id: 'task-2',
      title: 'Second Task',
      user_id: 'user-1',
      is_archived: false,
      created_at: new Date(),
    })

    const { tasks } = await sut.execute({
      userId: 'user-1',
      query: 'First',
      page: 1,
    })

    expect(tasks).toHaveLength(1)
    expect(tasks).toEqual([
      expect.objectContaining({
        title: 'First Task',
      }),
    ])
  })

  it('should return empty array if query is less than 2 characters', async () => {
    await tasksRepository.create({
      id: 'task-1',
      title: 'First Task',
      user_id: 'user-1',
      is_archived: false,
      created_at: new Date(),
    })
    const { tasks } = await sut.execute({
      userId: 'user-1',
      query: 'F',
      page: 1,
    })

    expect(tasks).toHaveLength(0)
  })

  it('should return empty array if query is empty', async () => {
    await tasksRepository.create({
      id: 'task-1',
      title: 'First Task',
      user_id: 'user-1',
      is_archived: false,
      created_at: new Date(),
    })
    const { tasks } = await sut.execute({
      userId: 'user-1',
      query: '   ',
      page: 1,
    })

    expect(tasks).toHaveLength(0)
  })

  it('should be able to paginate search results', async () => {
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
      query: 'Task',
      page: 2,
    })

    expect(tasks).toHaveLength(2)
    expect(tasks[0]?.title).toEqual('Task 21')
    expect(tasks[1]?.title).toEqual('Task 22')
  })

  it('should not return archived tasks in search results', async () => {
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
      query: 'Task',
      page: 1,
    })

    expect(tasks).toHaveLength(1)
    expect(tasks[0]?.title).toEqual('Active Task')
  })
})
