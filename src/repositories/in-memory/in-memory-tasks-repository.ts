import type { Prisma, Task } from 'generated/prisma/index.js'
import { randomUUID } from 'node:crypto'
import type { TasksRepository } from '../tasks-repository.ts'

export class InMemoryTasksRepository implements TasksRepository {
  public items: Task[] = []

  async create(data: Prisma.TaskUncheckedCreateInput) {
    const task: Task = {
      id: randomUUID(),
      title: data.title,
      description: data.description ?? null,
      status: (data.status as Task['status']) ?? 'TODO',
      priority: (data.priority as Task['priority']) ?? 'MEDIUM',
      due_date: data.due_date ? new Date(data.due_date) : null,
      completed_at: data.completed_at ? new Date(data.completed_at) : null,
      is_archived: data.is_archived ?? false,
      user_id: data.user_id,
      category_id: data.category_id ?? null,
      created_at: new Date(),
      updated_at: new Date(),
    }

    this.items.push(task)
    return task
  }
}
