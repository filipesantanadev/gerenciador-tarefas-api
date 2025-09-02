import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository.ts'
import { InMemoryTasksRepository } from '@/repositories/in-memory/in-memory-tasks-repository.ts'
import { AddCommentToTask } from './add-comment-to-task.ts'
import { InMemoryCommentsRepository } from '@/repositories/in-memory/in-memory-comments-repository.ts'
import { CommentIsRequiredError } from '../errors/comment-is-required.ts'
import { UnauthorizedError } from '../errors/unauthorized-error.ts'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.ts'
import { InvalidUpdateDataError } from '../errors/invalid-update-data-error.ts'

let commentsRepository: InMemoryCommentsRepository
let tasksRepository: InMemoryTasksRepository
let usersRepository: InMemoryUsersRepository
let sut: AddCommentToTask

describe('Create Task Use Case', () => {
  beforeEach(async () => {
    commentsRepository = new InMemoryCommentsRepository()
    tasksRepository = new InMemoryTasksRepository()
    usersRepository = new InMemoryUsersRepository()
    sut = new AddCommentToTask(
      commentsRepository,
      tasksRepository,
      usersRepository,
    )

    await usersRepository.create({
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: '123456',
    })

    await tasksRepository.create({
      id: 'task-1',
      title: 'Study JavaScript',
      description: 'Study JavaScript for Interview',
      status: 'TODO',
      priority: 'HIGH',
      due_date: new Date(),
      user_id: 'user-1',
      category_id: 'category-1',
    })
  })

  it('should be able to create a comment in task', async () => {
    const { comment } = await sut.execute({
      taskId: 'task-1',
      content: 'This is a comment',
      userId: 'user-1',
    })

    expect(comment.id).toEqual(expect.any(String))
    expect(comment.content).toEqual('This is a comment')
  })

  it('should not be able to create a comment in task when comment content is empty', async () => {
    await expect(() =>
      sut.execute({
        taskId: 'task-1',
        content: '',
        userId: 'user-1',
      }),
    ).rejects.toBeInstanceOf(CommentIsRequiredError)

    await expect(() =>
      sut.execute({
        taskId: 'task-1',
        content: ' ',
        userId: 'user-1',
      }),
    ).rejects.toBeInstanceOf(CommentIsRequiredError)
  })

  it('should not be able to create a comment in task with invalid user', async () => {
    await expect(() =>
      sut.execute({
        taskId: 'task-1',
        content: 'This is a comment',
        userId: 'invalid-user',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedError)
  })

  it('should not be able to create a comment in a non existing task', async () => {
    await expect(() =>
      sut.execute({
        taskId: 'non-existing-task',
        content: 'This is a comment',
        userId: 'user-1',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to create a comment in an archived task', async () => {
    await tasksRepository.update('task-1', { is_archived: true })

    await expect(() =>
      sut.execute({
        taskId: 'task-1',
        content: 'This is a comment',
        userId: 'user-1',
      }),
    ).rejects.toBeInstanceOf(InvalidUpdateDataError)
  })

  it('should not be able to create a comment in a task of another user', async () => {
    await usersRepository.create({
      id: 'user-2',
      name: 'Jane Doe',
      email: 'jane@example.com',
      password_hash: '123456',
    })

    await expect(() =>
      sut.execute({
        taskId: 'task-1',
        content: 'This is a comment',
        userId: 'user-2',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedError)
  })
})
