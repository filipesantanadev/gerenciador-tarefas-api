import request from 'supertest'
import { app } from '@/app.ts'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { prisma } from '@/lib/prisma.ts'

describe('Update Tag (e2e)', () => {
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

  it('should be able to update a tag', async () => {
    const user = await prisma.user.findFirstOrThrow()

    const createTag = await prisma.tag.create({
      data: {
        name: 'Important',
        color: '#EF4444',
        description: 'Critical tasks',
        created_by: user.id,
      },
    })

    const response = await request(app.server)
      .patch(`/tags/${createTag.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Very Important',
        color: '#10B981',
        description: 'Very Critical tasks',
        created_by: user.id,
      })

    expect(response.statusCode).toEqual(200)
    expect(response.body.tag.name).toEqual('Very Important')
    expect(response.body.tag.color).toEqual('#10B981')
    expect(response.body.tag.description).toEqual('Very Critical tasks')
  })
})
