import { beforeEach, describe, expect, it, vi } from 'vitest'
import { hash } from 'bcryptjs'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository.ts'
import { UpdateCommentUseCase } from './update-comment.ts'
import { InMemoryCommentsRepository } from '@/repositories/in-memory/in-memory-comments-repository.ts'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.ts'
import { UnauthorizedError } from '../errors/unauthorized-error.ts'
import { InvalidContentError } from '../errors/invalid-content-error.ts'

let commentsRepository: InMemoryCommentsRepository
let usersRepository: InMemoryUsersRepository
let sut: UpdateCommentUseCase

describe('Update Comment Use Case', () => {
  beforeEach(async () => {
    commentsRepository = new InMemoryCommentsRepository()
    usersRepository = new InMemoryUsersRepository()
    sut = new UpdateCommentUseCase(commentsRepository, usersRepository)

    await usersRepository.create({
      id: 'user-1',
      name: 'John Doe',
      email: 'johndoe@example.com',
      password_hash: await hash('123456', 6),
    })
  })
  it('should be able to update a comment', async () => {
    const comment = await commentsRepository.addCommentToTask({
      content: 'Initial Comment',
      task_id: 'task-1',
      user_id: 'user-1',
    })

    const { comment: updatedComment } = await sut.execute({
      id: comment.id,
      content: 'Updated Comment',
      userId: 'user-1',
    })
    expect(updatedComment.id).toEqual(comment.id)
    expect(updatedComment.content).toEqual('Updated Comment')
  })

  it('should not be able to update a comment with invalid user', async () => {
    const comment = await commentsRepository.addCommentToTask({
      content: 'Initial Comment',
      task_id: 'task-1',
      user_id: 'user-1',
    })

    await expect(() =>
      sut.execute({
        id: comment.id,
        content: 'Updated Comment',
        userId: 'invalid-user',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to update a non-existing comment', async () => {
    await expect(() =>
      sut.execute({
        id: 'non-existing-comment',
        content: 'Updated Comment',
        userId: 'user-1',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to update a comment with empty content', async () => {
    const comment = await commentsRepository.addCommentToTask({
      content: 'Initial Comment',
      task_id: 'task-1',
      user_id: 'user-1',
    })

    await expect(() =>
      sut.execute({
        id: comment.id,
        content: '   ',
        userId: 'user-1',
      }),
    ).rejects.toBeInstanceOf(InvalidContentError)
  })

  it('should not be able to update a comment when user is not the owner', async () => {
    const anotherUser = await usersRepository.create({
      id: 'user-2',
      name: 'Jane Doe',
      email: 'jane@example.com',
      password_hash: '123456',
    })

    const comment = await commentsRepository.addCommentToTask({
      content: 'Initial Comment',
      task_id: 'task-1',
      user_id: 'user-1',
    })

    await expect(() =>
      sut.execute({
        id: comment.id,
        content: 'Updated Comment',
        userId: anotherUser.id,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedError)
  })

  it('should throw ResourceNotFoundError when update fails', async () => {
    const comment = await commentsRepository.addCommentToTask({
      content: 'Initial Comment',
      task_id: 'task-1',
      user_id: 'user-1',
    })
    vi.spyOn(commentsRepository, 'update').mockResolvedValueOnce(null)

    await expect(
      sut.execute({
        id: comment.id,
        content: 'New content',
        userId: 'user-1',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
