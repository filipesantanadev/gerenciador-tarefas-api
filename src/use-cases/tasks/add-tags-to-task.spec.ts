import { beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository.ts'
import { InMemoryTasksRepository } from '@/repositories/in-memory/in-memory-tasks-repository.ts'
import { InMemoryTagsRepository } from '@/repositories/in-memory/in-memory-tags-repository.ts'
import { AddTagsToTaskUseCase } from './add-tags-to-task.ts'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.ts'
import { InvalidCredentialsError } from '../errors/invalid-credentials-error.ts'
import { UnauthorizedError } from '../errors/unauthorized-error.ts'

let tasksRepository: InMemoryTasksRepository
let usersRepository: InMemoryUsersRepository
let tagsRepository: InMemoryTagsRepository
let sut: AddTagsToTaskUseCase

describe('Add Tag to Task Use Case', () => {
  beforeEach(async () => {
    tasksRepository = new InMemoryTasksRepository()
    usersRepository = new InMemoryUsersRepository()
    tagsRepository = new InMemoryTagsRepository()
    sut = new AddTagsToTaskUseCase(
      tasksRepository,
      usersRepository,
      tagsRepository,
    )

    await usersRepository.create({
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: '123456',
    })
  })

  it('should be able to add existing tags to a task', async () => {
    const task = await tasksRepository.create({
      id: 'task-1',
      title: 'Study JavaScript',
      description: 'Study JavaScript for Interview',
      status: 'TODO',
      priority: 'HIGH',
      due_date: new Date(),
      user_id: 'user-1',
      category_id: 'category-1',
    })

    const tag1 = await tagsRepository.create({
      id: 'tag-1',
      name: 'Bug',
      creator: { connect: { id: 'user-1' } },
    })

    const tag2 = await tagsRepository.create({
      id: 'tag-2',
      name: 'Frontend',
      creator: { connect: { id: 'user-1' } },
    })

    const result = await sut.execute({
      taskId: 'task-1',
      userId: 'user-1',
      tags: [{ id: tag1.id }, { id: tag2.id }],
    })

    expect(result.task).toEqual(
      expect.objectContaining({
        id: task.id,
        title: 'Study JavaScript',
      }),
    )
    expect(result.addedTags).toHaveLength(2)
    expect(result.addedTags).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Bug' }),
        expect.objectContaining({ name: 'Frontend' }),
      ]),
    )
  })

  it('should be able to create new tags when they do not exist', async () => {
    const task = await tasksRepository.create({
      title: 'Test Task',
      description: 'Test Description',
      user_id: 'user-1',
      status: 'TODO',
      priority: 'MEDIUM',
      due_date: null,
      category_id: null,
    })

    const result = await sut.execute({
      taskId: task.id,
      userId: 'user-1',
      tags: [{ name: 'New Tag 1' }, { name: 'New Tag 2' }],
    })

    expect(result.task).toEqual(
      expect.objectContaining({
        id: task.id,
        title: 'Test Task',
      }),
    )
    expect(result.addedTags).toHaveLength(2)
    expect(result.addedTags).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'New Tag 1' }),
        expect.objectContaining({ name: 'New Tag 2' }),
      ]),
    )

    const createdTags = await Promise.all([
      tagsRepository.findByNameAndUserId('New Tag 1', 'user-1'),
      tagsRepository.findByNameAndUserId('New Tag 2', 'user-1'),
    ])

    expect(createdTags[0]).toBeTruthy()
    expect(createdTags[1]).toBeTruthy()
  })

  it('should be able to mix existing and new tags', async () => {
    const task = await tasksRepository.create({
      title: 'Test Task',
      description: 'Test Description',
      user_id: 'user-1',
      status: 'TODO',
      priority: 'MEDIUM',
      due_date: null,
      category_id: null,
    })

    const existingTag = await tagsRepository.create({
      name: 'Existing Tag',
      creator: { connect: { id: 'user-1' } },
    })

    const result = await sut.execute({
      taskId: task.id,
      userId: 'user-1',
      tags: [
        { id: existingTag.id, name: 'Existing Tag' },
        { name: 'Brand New Tag' },
      ],
    })

    expect(result.addedTags).toHaveLength(2)
    expect(result.addedTags).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Existing Tag' }),
        expect.objectContaining({ name: 'Brand New Tag' }),
      ]),
    )
  })

  it('should not be able add tags if user does not exist', async () => {
    const task = await tasksRepository.create({
      title: 'Test Task',
      description: 'Test Description',
      user_id: 'user-1',
      status: 'TODO',
      priority: 'MEDIUM',
      due_date: null,
      category_id: null,
    })

    await expect(() =>
      sut.execute({
        taskId: task.id,
        userId: 'non-existent-user-id',
        tags: [{ name: 'Some Tag' }],
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })

  it('should not be able add tags if task does not exist', async () => {
    await expect(() =>
      sut.execute({
        taskId: 'non-existent-task-id',
        userId: 'user-1',
        tags: [{ name: 'Some Tag' }],
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able add tags if task does not belong to user', async () => {
    const user2 = await usersRepository.create({
      id: 'user-2',
      name: 'Jane Doe',
      email: 'jane@example.com',
      password_hash: '123456',
    })

    const task = await tasksRepository.create({
      title: 'Test Task',
      description: 'Test Description',
      user_id: 'user-1',
      status: 'TODO',
      priority: 'MEDIUM',
      due_date: null,
      category_id: null,
    })

    await expect(() =>
      sut.execute({
        taskId: task.id,
        userId: user2.id,
        tags: [{ name: 'Some Tag' }],
      }),
    ).rejects.toBeInstanceOf(UnauthorizedError)
  })

  it('should not be able add tags that belong to other users', async () => {
    const user2 = await usersRepository.create({
      id: 'user-2',
      name: 'Jane Doe',
      email: 'jane@example.com',
      password_hash: '123456',
    })

    const task = await tasksRepository.create({
      title: 'Test Task',
      description: 'Test Description',
      user_id: 'user-1',
      status: 'TODO',
      priority: 'MEDIUM',
      due_date: null,
      category_id: null,
    })

    const otherUserTag = await tagsRepository.create({
      name: 'Other User Tag',
      creator: { connect: { id: user2.id } },
    })

    await expect(() =>
      sut.execute({
        taskId: task.id,
        userId: 'user-1',
        tags: [{ id: otherUserTag.id, name: 'Other User Tag' }],
      }),
    ).rejects.toBeInstanceOf(UnauthorizedError)
  })

  it('should not be able add tags when tag does not exists.', async () => {
    const task = await tasksRepository.create({
      title: 'Test Task',
      description: 'Test Description',
      user_id: 'user-1',
      status: 'TODO',
      priority: 'MEDIUM',
      due_date: null,
      category_id: null,
    })

    await expect(() =>
      sut.execute({
        taskId: task.id,
        userId: 'user-1',
        tags: [{ id: 'not-existing' }],
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to add tag if addTag returns null.', async () => {
    const task = await tasksRepository.create({
      title: 'Test Task',
      description: 'Test Description',
      user_id: 'user-1',
      status: 'TODO',
      priority: 'MEDIUM',
      due_date: null,
      category_id: null,
    })

    const tag = await tagsRepository.create({
      name: 'Test Tag',
      creator: { connect: { id: 'user-1' } },
    })

    vi.spyOn(tasksRepository, 'addTags').mockResolvedValueOnce(null)

    await expect(
      sut.execute({
        taskId: task.id,
        userId: 'user-1',
        tags: [{ id: tag.id }],
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should avoid duplicate tags', async () => {
    const task = await tasksRepository.create({
      title: 'Test Task',
      description: 'Test Description',
      user_id: 'user-1',
      status: 'TODO',
      priority: 'MEDIUM',
      due_date: null,
      category_id: null,
    })

    const tag = await tagsRepository.create({
      name: 'Duplicate Tag',
      creator: { connect: { id: 'user-1' } },
    })

    const result = await sut.execute({
      taskId: task.id,
      userId: 'user-1',
      tags: [
        { id: tag.id, name: 'Duplicate Tag' },
        { id: tag.id, name: 'Duplicate Tag' },
      ],
    })

    expect(result.addedTags).toHaveLength(2)
    expect(result.addedTags[0]?.id).toBe(tag.id)
    expect(result.addedTags[1]?.id).toBe(tag.id)
  })
})
