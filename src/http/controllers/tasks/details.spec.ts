import request from 'supertest'
import { app } from '@/app.ts'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { prisma } from '@/lib/prisma.ts'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user.ts'

describe('Get Details Task (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to get details task', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const pastDate = new Date()
    pastDate.setMonth(pastDate.getMonth() - 1)
    pastDate.setHours(12, 0, 0, 0)

    const futureDate = new Date()
    futureDate.setMonth(futureDate.getMonth() + 1)
    futureDate.setHours(12, 0, 0, 0)

    const farFutureDate = new Date()
    farFutureDate.setMonth(farFutureDate.getMonth() + 6)
    farFutureDate.setHours(12, 0, 0, 0)

    const user = await prisma.user.findFirstOrThrow()

    const [task1, task2] = await Promise.all([
      prisma.task.create({
        data: {
          title: 'Study JavaScript Fundamentals',
          description: 'Learn basic JavaScript concepts',
          status: 'TODO',
          priority: 'HIGH',
          due_date: futureDate,
          user_id: user.id,
        },
      }),
      prisma.task.create({
        data: {
          title: 'Review Code Quality',
          description: 'Code review session',
          status: 'IN_PROGRESS',
          priority: 'MEDIUM',
          due_date: pastDate,
          user_id: user.id,
        },
      }),
    ])

    const response1 = await request(app.server)
      .get(`/tasks/${task1.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response1.statusCode).toEqual(200)
    expect(response1.body.task.id).toBe(task1.id)
    expect(response1.body.task.title).toBe('Study JavaScript Fundamentals')
    expect(response1.body.task.status).toBe('TODO')
    expect(response1.body.task.priority).toBe('HIGH')

    const response2 = await request(app.server)
      .get(`/tasks/${task2.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response2.statusCode).toEqual(200)
    expect(response2.body.task.id).toBe(task2.id)
    expect(response2.body.task.title).toBe('Review Code Quality')
    expect(response2.body.task.status).toBe('IN_PROGRESS')
    expect(response2.body.task.priority).toBe('MEDIUM')
  })
})
