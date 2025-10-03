import request from 'supertest'
import { app } from '@/app.ts'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { prisma } from '@/lib/prisma.ts'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user.ts'

describe('Update Tag (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to update a tag', async () => {
    const { token } = await createAndAuthenticateUser(app)

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
