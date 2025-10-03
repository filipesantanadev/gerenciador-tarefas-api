import request from 'supertest'
import { app } from '@/app.ts'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { prisma } from '@/lib/prisma.ts'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user.ts'

describe('Create Task (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to create a task', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const futureDate = new Date()
    futureDate.setMonth(futureDate.getMonth() + 1)

    const user = await prisma.user.findFirstOrThrow()

    const response = await request(app.server)
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Study JavaScript Fundamentals',
        description: 'Learn basic JavaScript concepts',
        status: 'TODO',
        priority: 'HIGH',
        dueDate: futureDate,
        user,
      })

    expect(response.statusCode).toEqual(201)
  })
})
