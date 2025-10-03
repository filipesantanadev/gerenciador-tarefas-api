import request from 'supertest'
import { app } from '@/app.ts'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { prisma } from '@/lib/prisma.ts'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user.ts'

describe('Add Tags to Task (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to add tags in task', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const futureDate = new Date()
    futureDate.setMonth(futureDate.getMonth() + 1)

    const user = await prisma.user.findFirstOrThrow()

    const tag = await prisma.tag.create({
      data: {
        name: 'Work',
        created_by: user.id,
      },
    })

    const createdTask = await prisma.task.create({
      data: {
        title: 'Study JavaScript Fundamentals',
        description: 'Learn basic JavaScript concepts',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        due_date: futureDate,
        user_id: user.id,
      },
    })

    const response = await request(app.server)
      .post(`/tasks/${createdTask.id}/tags`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        tags: [{ id: tag.id }, { name: 'Personal', color: '#2AF' }],
      })

    expect(response.statusCode).toEqual(200)
    expect(response.body.task.tags).toHaveLength(2)
    expect(response.body.task.tags[0].id).toEqual(tag.id)
    expect(response.body.task.tags[0].name).toEqual('Work')
    expect(response.body.task.tags[1].id).toEqual(expect.any(String))
    expect(response.body.task.tags[1].color).toEqual('#22AAFF')
    expect(response.body.task.tags[1].name).toEqual('Personal')
  })
})
