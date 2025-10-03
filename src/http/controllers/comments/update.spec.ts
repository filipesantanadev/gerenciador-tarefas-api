import request from 'supertest'
import { app } from '@/app.ts'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { prisma } from '@/lib/prisma.ts'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user.ts'

describe('Update Comment in Task (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to update a comment in task', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const futureDate = new Date()
    futureDate.setMonth(futureDate.getMonth() + 1)

    const user = await prisma.user.findFirstOrThrow()

    const createTask = await prisma.task.create({
      data: {
        title: 'Study JavaScript Fundamentals',
        description: 'Learn basic JavaScript concepts',
        status: 'TODO',
        priority: 'HIGH',
        due_date: futureDate,
        user_id: user.id,
      },
    })

    const createComment = await prisma.comment.create({
      data: {
        content: 'This is a comment on the task',
        task_id: createTask.id,
        user_id: user.id,
      },
    })

    const response = await request(app.server)
      .patch(`/comments/${createComment.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        content: 'Updated comment content',
      })

    expect(response.statusCode).toEqual(200)
    expect(response.body).toEqual(
      expect.objectContaining({
        message: 'Comment updated successfully',
        comment: expect.objectContaining({
          id: expect.any(String),
          task_id: createTask.id,
          user_id: user.id,
          content: 'Updated comment content',
          created_at: expect.any(String),
        }),
      }),
    )
  })
})
