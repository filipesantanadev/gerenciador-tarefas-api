import request from 'supertest'
import { app } from '@/app.ts'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user.ts'

describe('Filter Tasks (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to filter tasks', async () => {
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

    const combinedFilterResponse = await request(app.server)
      .get('/tasks/filter?status=TODO&priority=HIGH&createdAfter=2025-09-21')
      .set('Authorization', `Bearer ${token}`)

    expect(combinedFilterResponse.statusCode).toEqual(200)

    const filteredTasks = combinedFilterResponse.body.tasks

    expect(filteredTasks).toHaveLength(2)
    expect(filteredTasks[0].title).toBe('Write Unit Tests')
    expect(filteredTasks[1].title).toBe('Study JavaScript Fundamentals')
    expect(combinedFilterResponse.body.pagination.totalItems).toBe(2)
  })
})
