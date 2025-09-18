import request from 'supertest'
import { app } from '@/app.ts'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { prisma } from '@/lib/prisma.ts'

describe('Update Task (E2E)', () => {
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

  it('should be able to update task', async () => {
    const futureDate = new Date()
    futureDate.setMonth(futureDate.getMonth() + 1)
    futureDate.setHours(12, 0, 0, 0)

    const farFutureDate = new Date()
    farFutureDate.setMonth(farFutureDate.getMonth() + 5)
    farFutureDate.setHours(8, 0, 0, 0)

    const user = await prisma.user.findFirstOrThrow()

    const createdTask = await prisma.task.create({
      data: {
        title: 'Study JavaScript Fundamentals',
        description: 'Learn basic JavaScript concepts',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        due_date: futureDate,
        user_id: user.id,
      },
    })

    const response = await request(app.server)
      .patch(`/tasks/${createdTask.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Study TypeScript',
        priority: 'URGENT',
        status: 'DONE',
        due_date: farFutureDate,
      })

    const today = new Date().toISOString().split('T')[0]
    const completedDate = new Date(response.body.task.completed_at)
      .toISOString()
      .split('T')[0]

    expect(response.statusCode).toEqual(200)
    expect(response.body.task.title).toEqual('Study TypeScript')
    expect(response.body.task.priority).toEqual('URGENT')
    expect(completedDate).toBe(today)
  })
})
