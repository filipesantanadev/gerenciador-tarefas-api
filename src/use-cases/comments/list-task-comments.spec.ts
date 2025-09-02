import { beforeEach, describe, expect, it } from 'vitest'
import { ListTaskCommentsUseCase } from './list-task-comments.ts'
import { InMemoryCommentsRepository } from '@/repositories/in-memory/in-memory-comments-repository.ts'

let commentsRepository: InMemoryCommentsRepository
let sut: ListTaskCommentsUseCase

describe('List Task Comments Use Case', () => {
  beforeEach(() => {
    commentsRepository = new InMemoryCommentsRepository()
    sut = new ListTaskCommentsUseCase(commentsRepository)
  })

  it('should be able to list comments by task id', async () => {
    await commentsRepository.addCommentToTask({
      task_id: 'task-1',
      content: 'This is a comment',
      user_id: 'user-1',
    })

    await commentsRepository.addCommentToTask({
      task_id: 'task-1',
      content: 'This is another comment',
      user_id: 'user-1',
    })

    const { comments } = await sut.execute({
      taskId: 'task-1',
    })

    expect(comments).toHaveLength(2)
  })

  it('should return an empty array if no comments exist for the task', async () => {
    const { comments } = await sut.execute({
      taskId: 'non-existing-task',
    })
    expect(comments).toEqual([])
  })

  it('should return an empty array if the task has no comments', async () => {
    await commentsRepository.addCommentToTask({
      task_id: 'task-1',
      content: 'This is a comment',
      user_id: 'user-1',
    })

    const { comments } = await sut.execute({
      taskId: 'task-2',
    })

    expect(comments).toEqual([])
  })
})
