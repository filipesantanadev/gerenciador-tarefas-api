import request from 'supertest'
import { app } from '@/app.ts'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { prisma } from '@/lib/prisma.ts'

describe('Create Category (e2e)', () => {
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

  it('should be able to create a category', async () => {
    const user = await prisma.user.findFirstOrThrow()

    const response = await request(app.server)
      .post('/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'University',
        description: 'All tasks of university',
        color: '#0ABAAA',
        icon: '📚',
        isDefault: false,
        userId: user.id,
      })

    expect(response.statusCode).toEqual(201)
    expect(response.body.category.name).toEqual('University')
  })
})
