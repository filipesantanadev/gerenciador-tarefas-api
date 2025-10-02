import request from 'supertest'
import { app } from '@/app.ts'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { prisma } from '@/lib/prisma.ts'

describe('Delete Comment in Task (e2e)', () => {
  let token: string

  beforeAll(async () => {
    await app.ready()

    await request(app.server).post('/users').send({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
      confirmPassword: '123456',
    })

    const authResponse = await request(app.server).post('/sessions').send({
      email: 'johndoe@example.com',
      password: '123456',
    })

    token = authResponse.body.token
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to delete a comment in task', async () => {
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
      .delete(`/comments/${createComment.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toEqual(204)

    const deleteComment = await prisma.comment.findUnique({
      where: {
        id: createComment.id,
      },
    })

    expect(deleteComment?.id).toBe(undefined)
  })
})
