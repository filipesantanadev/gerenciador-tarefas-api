import request from 'supertest'
import { app } from '@/app.ts'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { prisma } from '@/lib/prisma.ts'

describe('Update Category (E2E)', () => {
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

  it('should be able to update category', async () => {
    const futureDate = new Date()
    futureDate.setMonth(futureDate.getMonth() + 1)
    futureDate.setHours(12, 0, 0, 0)

    const user = await prisma.user.findFirstOrThrow()

    const category = await prisma.category.create({
      data: {
        name: 'University',
        description: 'All tasks of university',
        color: '#0ABAAA',
        icon: '📚',
        is_default: false,
        user_id: user.id,
      },
    })

    const response = await request(app.server)
      .patch(`/categories/${category.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'University Harvard',
        description: 'All tasks of university Harvard',
        color: '#FF2B6F',
      })

    expect(response.statusCode).toEqual(200)
    expect(response.body.category.name).toEqual('University Harvard')
    expect(response.body.category.description).toEqual(
      'All tasks of university Harvard',
    )
    expect(response.body.category.color).toEqual('#FF2B6F')
  })
})
