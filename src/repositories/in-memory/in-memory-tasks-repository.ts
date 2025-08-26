import type { Prisma, Task } from 'generated/prisma/index.js'
import { randomUUID } from 'node:crypto'
import type { FindManyParams, TasksRepository } from '../tasks-repository.ts'

export class InMemoryTasksRepository implements TasksRepository {
  public items: Task[] = []

  async findMany(params: FindManyParams): Promise<Task[]> {
    const {
      userId,
      query,
      status,
      categoryId,
      priority,
      dueDate,
      page = 1,
    } = params

    let tasks = this.items.filter((task) => task.user_id === userId)

    // filtros
    if (query) {
      tasks = tasks.filter((task) =>
        task.title.toLowerCase().includes(query.toLowerCase()),
      )
    }
    if (status) tasks = tasks.filter((task) => task.status === status)
    if (categoryId)
      tasks = tasks.filter((task) => task.category_id === categoryId)
    if (priority) tasks = tasks.filter((task) => task.priority === priority)
    if (dueDate) {
      tasks = tasks.filter(
        (task) =>
          task.due_date?.toISOString().split('T')[0] ===
          dueDate.toISOString().split('T')[0],
      )
    }

    // paginação
    const pageSize = 10
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize

    return tasks.slice(startIndex, endIndex)
  }

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
