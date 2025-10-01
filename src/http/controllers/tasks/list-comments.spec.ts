import request from 'supertest'
import { app } from '@/app.ts'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { prisma } from '@/lib/prisma.ts'

describe('List Comments in Task (e2e)', () => {
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

  it('should be able to list a comments in task', async () => {
    const futureDate = new Date()
    futureDate.setMonth(futureDate.getMonth() + 1)

    const user = await prisma.user.findFirstOrThrow()

    const createTask = await prisma.task.create({
      data: {
        title: 'Study JavaScript Fundamentals',
        description: 'Learn basic JavaScript concepts',
        status: 'TODO',
        priority: 'HIGH',
        due_date: futureDate,
        user_id: user.id,
      },
    })

    await prisma.comment.create({
      data: {
        content: 'This is a comment on the task',
        task_id: createTask.id,
        user_id: user.id,
      },
    })

    // Comentários informativos
    await prisma.comment.create({
      data: {
        content: 'This task needs to be completed by end of week',
        task_id: createTask.id,
        user_id: user.id,
      },
    })

    await prisma.comment.create({
      data: {
        content: 'I have started working on this task',
        task_id: createTask.id,
        user_id: user.id,
      },
    })

    // Comentários de progresso
    await prisma.comment.create({
      data: {
        content: 'Making good progress, 50% complete',
        task_id: createTask.id,
        user_id: user.id,
      },
    })

    await prisma.comment.create({
      data: {
        content: 'Encountered a blocker, need help with API integration',
        task_id: createTask.id,
        user_id: user.id,
      },
    })

    // Comentários de perguntas
    await prisma.comment.create({
      data: {
        content: 'Should we use TypeScript or JavaScript for this?',
        task_id: createTask.id,
        user_id: user.id,
      },
    })

    await prisma.comment.create({
      data: {
        content: 'What is the expected deadline for this deliverable?',
        task_id: createTask.id,
        user_id: user.id,
      },
    })

    // Comentários técnicos
    await prisma.comment.create({
      data: {
        content: 'Need to refactor the authentication logic before proceeding',
        task_id: createTask.id,
        user_id: user.id,
      },
    })

    await prisma.comment.create({
      data: {
        content: 'Found a bug in the payment gateway integration',
        task_id: createTask.id,
        user_id: user.id,
      },
    })

    // Comentários de atualização
    await prisma.comment.create({
      data: {
        content: 'Updated the requirements based on client feedback',
        task_id: createTask.id,
        user_id: user.id,
      },
    })

    await prisma.comment.create({
      data: {
        content: 'Task completed and ready for review',
        task_id: createTask.id,
        user_id: user.id,
      },
    })

    // Comentários de revisão
    await prisma.comment.create({
      data: {
        content: 'Code review completed, looks good to merge',
        task_id: createTask.id,
        user_id: user.id,
      },
    })

    await prisma.comment.create({
      data: {
        content: 'Please add unit tests before marking as done',
        task_id: createTask.id,
        user_id: user.id,
      },
    })

    // Comentários de documentação
    await prisma.comment.create({
      data: {
        content: 'Added documentation in the README file',
        task_id: createTask.id,
        user_id: user.id,
      },
    })

    // Comentários de dependências
    await prisma.comment.create({
      data: {
        content: 'Waiting for Task #123 to be completed first',
        task_id: createTask.id,
        user_id: user.id,
      },
    })

    // Comentários longos
    await prisma.comment.create({
      data: {
        content:
          'After analyzing the requirements, I believe we should implement this feature in phases. Phase 1 will focus on the core functionality, Phase 2 on performance optimization, and Phase 3 on additional features.',
        task_id: createTask.id,
        user_id: user.id,
      },
    })

    const response = await request(app.server)
      .get(`/tasks/${createTask.id}/comments`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toEqual(200)
    expect(response.body).toEqual(
      expect.objectContaining({
        comments: expect.any(Array),
      }),
    )
  })
})
