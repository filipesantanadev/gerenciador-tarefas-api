import request from 'supertest'
import { app } from '@/app.ts'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { prisma } from '@/lib/prisma.ts'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user.ts'

describe('Update Task (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to update task', async () => {
    const { token } = await createAndAuthenticateUser(app)

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
