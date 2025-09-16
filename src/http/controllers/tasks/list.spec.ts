import request from 'supertest'
import { app } from '@/app.ts'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Task } from 'generated/prisma/index.js'

describe('List Tasks (E2E)', () => {
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

  it('should list user tasks including a past-due completed task', async () => {
    const pastDate = new Date()
    pastDate.setMonth(pastDate.getMonth() - 1)
    pastDate.setHours(12, 0, 0, 0)

    const futureDate = new Date()
    futureDate.setMonth(futureDate.getMonth() + 1)
    futureDate.setHours(12, 0, 0, 0)

    const farFutureDate = new Date()
    farFutureDate.setMonth(farFutureDate.getMonth() + 6)
    farFutureDate.setHours(12, 0, 0, 0)

    const tasksToCreate = [
      {
        title: 'Study JavaScript Fundamentals',
        description: 'Learn basic JavaScript concepts',
        status: 'TODO',
        priority: 'HIGH',
        dueDate: futureDate,
      },
      {
        title: 'Study React Hooks',
        description: 'Learn advanced React concepts',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        dueDate: farFutureDate,
      },
      {
        title: 'Review Code Quality',
        description: 'Code review session',
        status: 'TODO',
        priority: 'LOW',
        dueDate: futureDate,
      },
      {
        title: 'Deploy Application',
        description: 'Deploy to production environment',
        status: 'IN_PROGRESS',
        priority: 'URGENT',
        dueDate: futureDate,
      },
      {
        title: 'Write Unit Tests',
        description: 'Create comprehensive test suite',
        status: 'TODO',
        priority: 'HIGH',
        dueDate: futureDate,
      },
      {
        title: 'Take my car for a service',
        description: 'Do a general check-up of my car before the trip',
        status: 'DONE',
        priority: 'URGENT',
        dueDate: pastDate,
      },
    ]

    for (const task of tasksToCreate) {
      await request(app.server)
        .post('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(task)
    }

    const AllResponses = await request(app.server)
      .get('/tasks')
      .set('Authorization', `Bearer ${token}`)

    expect(AllResponses.statusCode).toEqual(200)
    expect(AllResponses.body.tasks).toHaveLength(6)
    expect(AllResponses.body.pagination).toBeDefined()
    expect(AllResponses.body.pagination.page).toBe(1)
    expect(AllResponses.body.pagination.total).toBe(6)

    const combinedFilterResponse = await request(app.server)
      .get('/tasks?status=TODO&priority=HIGH&orderBy=title&order=desc')
      .set('Authorization', `Bearer ${token}`)

    expect(combinedFilterResponse.statusCode).toEqual(200)
    expect(
      combinedFilterResponse.body.tasks.every(
        (task: Task) => task.status === 'TODO' && task.priority === 'HIGH',
      ),
    ).toBe(true)
  })
})
