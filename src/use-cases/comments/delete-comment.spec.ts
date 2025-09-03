import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository.ts'
import { hash } from 'bcryptjs'
import { InMemoryCommentsRepository } from '@/repositories/in-memory/in-memory-comments-repository.ts'
import { DeleteCommentUseCase } from './delete-comment.ts'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.ts'
import { UnauthorizedError } from '../errors/unauthorized-error.ts'

let commentsRepository: InMemoryCommentsRepository
let usersRepository: InMemoryUsersRepository
let sut: DeleteCommentUseCase

describe('Delete Comment Use Case', () => {
  beforeEach(async () => {
    commentsRepository = new InMemoryCommentsRepository()
    usersRepository = new InMemoryUsersRepository()
    sut = new DeleteCommentUseCase(commentsRepository, usersRepository)

    await usersRepository.create({
      id: 'user-1',
      name: 'John Doe',
      email: 'johndoe@example.com',
      password_hash: await hash('123456', 6),
    })

    await commentsRepository.addCommentToTask({
      id: 'comment-1',
      content: 'Initial Comment',
      task_id: 'task-1',
      user_id: 'user-1',
    })
  })

  it('should be able to delete a comment', async () => {
    await sut.execute({
      id: 'comment-1',
      userId: 'user-1',
    })

    const comment = await commentsRepository.findById('comment-1')
    expect(comment).toBeNull()
  })

  it('should not be able to delete a comment with invalid user', async () => {
    await expect(() =>
      sut.execute({
        id: 'comment-1',
        userId: 'invalid-user',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to delete a non-existing comment', async () => {
    await expect(() =>
      sut.execute({
        id: 'non-existing-comment',
        userId: 'user-1',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to delete a comment if user is not the owner', async () => {
    await usersRepository.create({
      id: 'user-2',
      name: 'Jane Doe',
      email: 'jane@example.com',
      password_hash: '123456',
    })
    await expect(() =>
      sut.execute({
        id: 'comment-1',
        userId: 'user-2',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedError)
  })

  it('should be able to delete a comment if user is admin', async () => {
    await usersRepository.create({
      id: 'admin-user',
      name: 'Admin User',
      email: 'admin@example.com',
      password_hash: '123456',
      role: 'ADMIN',
    })

    await sut.execute({
      id: 'comment-1',
      userId: 'admin-user',
    })

    const comment = await commentsRepository.findById('comment-1')
    expect(comment).toBeNull()
  })
})
