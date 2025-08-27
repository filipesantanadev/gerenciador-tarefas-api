import type {
  Priority,
  Prisma,
  Task,
  TaskStatus,
} from 'generated/prisma/index.js'
import { randomUUID } from 'node:crypto'
import type { FindManyParams, TasksRepository } from '../tasks-repository.ts'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error.ts'

export class InMemoryTasksRepository implements TasksRepository {
  public items: Task[] = []

  async findById(id: string) {
    const task = this.items.find((item) => item.id === id)

    if (!task) return null

    return task
  }

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

    const pageSize = 10
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize

    return tasks.slice(startIndex, endIndex)
  }

  async findByCategoryId(categoryId: string) {
    return this.items.filter((item) => item.category_id === categoryId)
  }

  async update(id: string, data: Prisma.TaskUpdateInput) {
    const taskIndex = this.items.findIndex((item) => item.id === id)

    if (taskIndex === -1) throw new ResourceNotFoundError()

    const currentTask = this.items[taskIndex]

    if (!currentTask) throw new ResourceNotFoundError()

    const updatedCategory: Task = {
      id: currentTask.id,
      title: (data.title as string) ?? currentTask.title,
      description:
        data.description !== undefined
          ? (data.description as string)
          : currentTask.description,
      status: (data.status as TaskStatus) ?? currentTask.status,
      priority: (data.priority as Priority) ?? currentTask.priority,
      due_date:
        data.due_date !== undefined
          ? (data.due_date as Date | null)
          : currentTask.due_date,
      completed_at:
        data.completed_at !== undefined
          ? (data.completed_at as Date)
          : currentTask.completed_at,
      is_archived: (data.is_archived as boolean) ?? currentTask.is_archived,
      created_at: currentTask.created_at,
      updated_at: new Date(),
      user_id: currentTask.user_id,
      category_id: currentTask.category_id,
    }

    this.items[taskIndex] = updatedCategory

    return updatedCategory
  }

  async create(data: Prisma.TaskUncheckedCreateInput) {
    const task: Task = {
      id: data.id ?? randomUUID(),
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
