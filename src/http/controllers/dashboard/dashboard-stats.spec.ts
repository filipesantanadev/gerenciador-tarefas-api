import request from 'supertest'
import { app } from '@/app.ts'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { prisma } from '@/lib/prisma.ts'
import { hash } from 'bcryptjs'

describe('Get Dashboard Stats (E2E)', () => {
  let adminToken: string
  let userToken: string
  let otherUserToken: string

  beforeAll(async () => {
    await app.ready()

    await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin@example.com',
        password_hash: await hash('123456', 6),
        role: 'ADMIN',
      },
    })

    const adminAuthResponse = await request(app.server).post('/sessions').send({
      email: 'admin@example.com',
      password: '123456',
    })

    adminToken = adminAuthResponse.body.token

    await prisma.user.create({
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        password_hash: await hash('123456', 6),
        role: 'USER',
      },
    })

    const userAuthResponse = await request(app.server).post('/sessions').send({
      email: 'john@example.com',
      password: '123456',
    })

    await prisma.user.create({
      data: {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password_hash: await hash('123456', 6),
        role: 'USER',
      },
    })

    const otherUserAuthResponse = await request(app.server)
      .post('/sessions')
      .send({
        email: 'jane@example.com',
        password: '123456',
      })

    userToken = userAuthResponse.body.token

    otherUserToken = otherUserAuthResponse.body.token
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to get dashboard statistics with filter email', async () => {
    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - 5)

    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 5)

    await request(app.server)
      .post('/tasks')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Task TODO 1',
        status: 'TODO',
        priority: 'HIGH',
        dueDate: futureDate,
      })

    await request(app.server)
      .post('/tasks')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Task TODO 2',
        status: 'TODO',
        priority: 'MEDIUM',
      })

    await request(app.server)
      .post('/tasks')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Overdue Task',
        status: 'TODO',
        priority: 'URGENT',
        dueDate: pastDate,
      })

    await request(app.server)
      .post('/tasks')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Task In Progress',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
      })

    await request(app.server)
      .post('/tasks')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Task Done 1',
        status: 'DONE',
        priority: 'MEDIUM',
      })

    await request(app.server)
      .post('/tasks')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Task Done 2',
        status: 'DONE',
        priority: 'LOW',
      })

    await request(app.server)
      .post('/tasks')
      .set('Authorization', `Bearer ${otherUserToken}`)
      .send({
        title: 'Task Cancelled',
        status: 'CANCELLED',
        priority: 'LOW',
      })

    const response = await request(app.server)
      .get('/dashboard/stats?userEmail=john@example.com')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('stats')

    const { stats, user } = response.body

    expect(stats).toEqual({
      totalTasks: 6,
      tasksByStatus: {
        todo: 3,
        inProgress: 1,
        done: 2,
        cancelled: 0,
      },
      overdueTasks: 1,
      completionRate: 33,
    })
    expect(response.body).toHaveProperty('user')
    expect(user).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: 'John Doe',
        email: 'john@example.com',
      }),
    )
  })

  it('should allow admin to get all tasks', async () => {
    await request(app.server)
      .post('/tasks')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Task Cancelled',
        status: 'CANCELLED',
        priority: 'LOW',
      })

    const response = await request(app.server)
      .get('/dashboard/stats')
      .set('Authorization', `Bearer ${adminToken}`)

    const { stats } = response.body

    expect(response.statusCode).toBe(200)
    expect(stats).toEqual({
      totalTasks: 8,
      tasksByStatus: {
        todo: 3,
        inProgress: 1,
        done: 2,
        cancelled: 2,
      },
      overdueTasks: 1,
      completionRate: 25,
    })
  })

  it('should be able to get my owns dashboard statistics', async () => {
    const response = await request(app.server)
      .get('/dashboard/stats')
      .set('Authorization', `Bearer ${userToken}`)

    const { stats } = response.body

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('stats')
    expect(stats).toEqual({
      totalTasks: 7,
      tasksByStatus: {
        todo: 3,
        inProgress: 1,
        done: 2,
        cancelled: 1,
      },
      overdueTasks: 1,
      completionRate: 29,
    })
  })
})
