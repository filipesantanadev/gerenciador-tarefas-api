import request from 'supertest'
import { app } from '@/app.ts'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { prisma } from '@/lib/prisma.ts'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user.ts'

describe('Delete Tag (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to delete a tag', async () => {
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
      .delete(`/tags/${createTag.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toEqual(204)
    expect(response.body).toEqual({})
  })
})
