import request from 'supertest'
import { app } from '@/app.ts'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { prisma } from '@/lib/prisma.ts'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user.ts'

describe('Delete Task (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to delete task', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const futureDate = new Date()
    futureDate.setMonth(futureDate.getMonth() + 1)
    futureDate.setHours(12, 0, 0, 0)

    const user = await prisma.user.findFirstOrThrow()

    const task = await prisma.task.create({
      data: {
        title: 'Study JavaScript Fundamentals',
        description: 'Learn basic JavaScript concepts',
        status: 'TODO',
        priority: 'HIGH',
        due_date: futureDate,
        user_id: user.id,
      },
    })

    const response = await request(app.server)
      .delete(`/tasks/${task.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toEqual(204)

    const deletedTask = await prisma.task.findUnique({
      where: {
        id: task.id,
      },
    })

    expect(deletedTask).toBeNull()
  })
})
