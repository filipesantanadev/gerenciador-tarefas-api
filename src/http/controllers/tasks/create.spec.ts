import request from 'supertest'
import { app } from '@/app.ts'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

describe('Create Task (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it.only('should be able to create a task', async () => {
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

    const { token } = authResponse.body

    const futureDate = new Date()
    futureDate.setMonth(futureDate.getMonth() + 3)

    const response = await request(app.server)
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Study JavaScript',
        description: 'Study JavaScript for Interview',
        status: 'TODO',
        priority: 'HIGH',
        dueDate: futureDate,
      })

    expect(response.statusCode).toEqual(201)
  })
})
