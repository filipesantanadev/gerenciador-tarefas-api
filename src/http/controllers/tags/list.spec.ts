import request from 'supertest'
import { app } from '@/app.ts'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { prisma } from '@/lib/prisma.ts'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user.ts'

describe('List Tags (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to list tags', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const user = await prisma.user.findFirstOrThrow()

    await request(app.server)
      .post('/tags')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Urgent',
        color: '#DC2626',
        description: 'Tasks that need immediate attention',
        created_by: user.id,
      })

    await request(app.server)
      .post('/tags')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Important',
        color: '#EF4444',
        description: 'Critical tasks',
        created_by: user.id,
      })

    await request(app.server)
      .post('/tags')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Low Priority',
        color: '#10B981',
        description: 'Can be done later',
        created_by: user.id,
      })

    // Work-related Tags
    await request(app.server)
      .post('/tags')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Meeting',
        color: '#3B82F6',
        description: 'Related to meetings',
        created_by: user.id,
      })

    await request(app.server)
      .post('/tags')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Review',
        color: '#8B5CF6',
        description: 'Needs code or document review',
        created_by: user.id,
      })

    await request(app.server)
      .post('/tags')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Bug',
        color: '#F59E0B',
        description: 'Bug fixes',
        created_by: user.id,
      })

    // Development Tags
    await request(app.server)
      .post('/tags')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Frontend',
        color: '#06B6D4',
        description: 'Frontend development tasks',
        created_by: user.id,
      })

    await request(app.server)
      .post('/tags')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Backend',
        color: '#84CC16',
        description: 'Backend development tasks',
        created_by: user.id,
      })

    await request(app.server)
      .post('/tags')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Testing',
        color: '#A855F7',
        description: 'Testing and QA tasks',
        created_by: user.id,
      })

    // Status Tags
    await request(app.server)
      .post('/tags')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Blocked',
        color: '#EF4444',
        description: 'Waiting on dependencies',
        created_by: 'user-1',
      })

    await request(app.server)
      .post('/tags')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'In Progress',
        color: '#F59E0B',
        description: 'Currently being worked on',
        created_by: user.id,
      })

    await request(app.server)
      .post('/tags')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Ready',
        color: '#10B981',
        description: 'Ready to be started',
        created_by: user.id,
      })

    // Documentation
    await request(app.server)
      .post('/tags')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Documentation',
        color: '#6366F1',
        description: 'Documentation tasks',
        created_by: user.id,
      })

    // Personal
    await request(app.server)
      .post('/tags')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Learning',
        color: '#EC4899',
        description: 'Learning and study tasks',
        created_by: user.id,
      })

    await request(app.server)
      .post('/tags')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Research',
        color: '#14B8A6',
        description: 'Research and investigation',
        created_by: user.id,
      })

    const response = await request(app.server)
      .get('/tags')
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toEqual(200)
    expect(response.body.pagination.total).toEqual(15)

    const combinedFilterResponse = await request(app.server)
      .get('/tags?search=B&sortBy=name&order=desc')
      .set('Authorization', `Bearer ${token}`)

    const tags = combinedFilterResponse.body.tags
    expect(
      tags.every((tag: { name: string }) =>
        tag.name.toLowerCase().includes('b'),
      ),
    ).toBe(true)

    expect(tags[0].name).toBe('Bug')
    expect(tags[1].name).toBe('Blocked')
    expect(tags[2].name).toBe('Backend')
  })
})
