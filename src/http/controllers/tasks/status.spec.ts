import request from 'supertest'
import { app } from '@/app.ts'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { prisma } from '@/lib/prisma.ts'
import { TaskStatus } from 'generated/prisma/index.js'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user.ts'

describe('Update Task Status (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to update task status', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const futureDate = new Date()
    futureDate.setMonth(futureDate.getMonth() + 1)
    futureDate.setHours(12, 0, 0, 0)

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
      .patch(`/tasks/${createdTask.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        status: 'DONE',
      })

    const today = new Date().toISOString().split('T')[0]
    const completedDate = new Date(response.body.task.completed_at)
      .toISOString()
      .split('T')[0]

    expect(response.statusCode).toEqual(200)
    expect(response.body.task.status).toEqual(TaskStatus.DONE)
    expect(completedDate).toBe(today)
  })
})
