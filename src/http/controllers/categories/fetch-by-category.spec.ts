import request from 'supertest'
import { app } from '@/app.ts'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { prisma } from '@/lib/prisma.ts'
import type { Task } from 'generated/prisma/index.js'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user.ts'

describe('Fetch Tasks by Category (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to fetch tasks by category', async () => {
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

    const studyCategory = await prisma.category.create({
      data: {
        name: 'Study',
        color: '#BAF3C1',
        user_id: user.id,
      },
    })

    const workCategory = await prisma.category.create({
      data: {
        name: 'Work',
        color: '#AE0000',
        user_id: user.id,
      },
    })

    const personalCategory = await prisma.category.create({
      data: {
        name: 'Personal',
        color: '#F111AA',
        user_id: user.id,
      },
    })

    const tasksToCreate = [
      {
        title: 'Study JavaScript Fundamentals',
        description: 'Learn basic JavaScript concepts',
        status: 'TODO',
        priority: 'HIGH',
        dueDate: futureDate,
        categoryId: studyCategory.id,
      },
      {
        title: 'Study React Hooks',
        description: 'Learn advanced React concepts',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        dueDate: farFutureDate,
        categoryId: studyCategory.id,
      },
      {
        title: 'Review Code Quality',
        description: 'Code review session',
        status: 'TODO',
        priority: 'LOW',
        dueDate: futureDate,
        categoryId: workCategory.id,
      },
      {
        title: 'Deploy Application',
        description: 'Deploy to production environment',
        status: 'IN_PROGRESS',
        priority: 'URGENT',
        dueDate: futureDate,
        categoryId: workCategory.id,
      },
      {
        title: 'Write Unit Tests',
        description: 'Create comprehensive test suite',
        status: 'TODO',
        priority: 'HIGH',
        dueDate: futureDate,
        categoryId: workCategory.id,
      },
      {
        title: 'Take my car for a service',
        description: 'Do a general check-up of my car before the trip',
        status: 'DONE',
        priority: 'URGENT',
        dueDate: pastDate,
        categoryId: personalCategory.id,
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

    const result = await request(app.server)
      .get(`/categories/${workCategory.id}/tasks`)
      .set('Authorization', `Bearer ${token}`)

    expect(result.statusCode).toEqual(200)

    expect(result.body.pagination.page).toBe(1)

    result.body.tasks.forEach((task: Task) => {
      expect(task.category_id).toBe(workCategory.id)
    })

    const taskTitles = result.body.tasks.map((task: Task) => task.title)
    expect(taskTitles).toContain('Review Code Quality')
    expect(taskTitles).toContain('Deploy Application')
    expect(taskTitles).toContain('Write Unit Tests')
  })
})
