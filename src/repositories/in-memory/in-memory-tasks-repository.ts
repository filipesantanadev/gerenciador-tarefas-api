import {
  TaskStatus,
  type Category,
  type Priority,
  type Prisma,
  type Tag,
  type Task,
} from 'generated/prisma/index.js'
import { randomUUID } from 'node:crypto'
import type {
  AdvancedFilterParams,
  FindManyParams,
  TasksRepository,
  TaskWithRelations,
} from '../tasks-repository.ts'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error.ts'

export class InMemoryTasksRepository implements TasksRepository {
  public items: Task[] = []
  public taskTags: Array<{ taskId: string; tagId: string }> = []
  private categories: Category[] = []
  private tags: Tag[] = []

  async removeTag(taskId: string, tagId: string) {
    const task = this.items.find(
      (item) => item.id === taskId && !item.is_archived,
    )

    if (!task) {
      return null
    }

    const relationIndex = this.taskTags.findIndex(
      (rel) => rel.taskId === taskId && rel.tagId === tagId,
    )
    if (relationIndex !== -1) {
      this.taskTags.splice(relationIndex, 1)
    }

    task.updated_at = new Date()
    return task
  }

  async addTags(taskId: string, tagIds: string[]) {
    const task = this.items.find(
      (item) => item.id === taskId && !item.is_archived,
    )

    if (!task) {
      return null
    }

    for (const tagId of tagIds) {
      const relationExists = this.taskTags.some(
        (rel) => rel.taskId === taskId && rel.tagId === tagId,
      )

      if (!relationExists) {
        this.taskTags.push({ taskId, tagId })
      }
    }

    task.updated_at = new Date()
    return task
  }

  async findById(id: string) {
    const task = this.items.find((item) => item.id === id)

    if (!task) return null

    return task
  }

  async findManyByCategoryId(categoryId: string) {
    return this.items.filter((item) => item.category_id === categoryId)
  }

  async findMany(params: FindManyParams) {
    const {
      userId,
      query,
      status,
      categoryId,
      tagIds,
      priority,
      dueDate,
      includeArchived = false,
      page = 1,
    } = params

    let tasks = this.items.filter((task) => task.user_id === userId)

    if (!includeArchived) {
      tasks = tasks.filter((task) => !task.is_archived)
    }

    // Apply filters
    if (query) {
      tasks = tasks.filter((task) =>
        task.title.toLowerCase().includes(query.toLowerCase()),
      )
    }

    if (status) tasks = tasks.filter((task) => task.status === status)

    if (categoryId)
      tasks = tasks.filter((task) => task.category_id === categoryId)

    if (tagIds && tagIds.length > 0) {
      tasks = tasks.filter((task) => {
        const taskTagIds = this.taskTags
          .filter((taskTag) => taskTag.taskId === task.id)
          .map((taskTag) => taskTag.tagId)

        return tagIds.some((tagId) => taskTagIds.includes(tagId))
      })
    }
    if (priority) tasks = tasks.filter((task) => task.priority === priority)

    if (dueDate) {
      tasks = tasks.filter(
        (task) =>
          task.due_date?.toISOString().split('T')[0] ===
          dueDate.toISOString().split('T')[0],
      )
    }

    // Sort by created_at descending
    tasks = tasks.sort((a, b) => {
      return b.created_at.getTime() - a.created_at.getTime()
    })

    // Pagination
    const pageSize = 10
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize

    const paginatedTasks = tasks.slice(startIndex, endIndex)

    // Include relations
    const tasksWithRelations: TaskWithRelations[] = paginatedTasks.map(
      (task) => ({
        ...task,
        category:
          this.categories.find((cat) => cat.id === task.category_id) || null,
        tags: this.taskTags
          .filter((taskTag) => taskTag.taskId === task.id)
          .map((taskTag) => this.tags.find((tag) => tag.id === taskTag.tagId))
          .filter((tag): tag is Tag => tag !== undefined),
      }),
    )

    return tasksWithRelations
  }

  async findManyWithAdvanceFilters(params: AdvancedFilterParams) {
    const {
      userId,
      title,
      status,
      categoryId,
      tagIds,
      priority,
      dueDateFrom,
      dueDateTo,
      createdAfter,
      createdBefore,
      hasDescription,
      overdue,
      includeArchived = false,
      orderBy = 'createdAt',
      order = 'desc',
      page = 1,
    } = params

    let tasks = this.items.filter((task) => task.user_id === userId)

    // Basic filters
    if (title) {
      tasks = tasks.filter((task) =>
        task.title.toLowerCase().includes(title.toLowerCase()),
      )
    }

    if (!includeArchived) {
      tasks = tasks.filter((task) => !task.is_archived)
    }

    if (status) {
      tasks = tasks.filter((task) => task.status === status)
    }

    if (categoryId) {
      tasks = tasks.filter((task) => task.category_id === categoryId)
    }

    if (priority) {
      tasks = tasks.filter((task) => task.priority === priority)
    }

    if (tagIds && tagIds.length > 0) {
      tasks = tasks.filter((task) => {
        const taskTagIds = this.taskTags
          .filter((taskTag) => taskTag.taskId === task.id)
          .map((taskTag) => taskTag.tagId)

        return tagIds.some((tagId: string) => taskTagIds.includes(tagId))
      })
    }

    // Date range filters
    if (dueDateFrom) {
      tasks = tasks.filter((task) => {
        if (!task.due_date) return false
        return task.due_date >= dueDateFrom
      })
    }

    if (dueDateTo) {
      tasks = tasks.filter((task) => {
        if (!task.due_date) return false
        return task.due_date <= dueDateTo
      })
    }

    if (createdAfter) {
      tasks = tasks.filter((task) => {
        console.log(
          'createdAfter:',
          createdAfter,
          'task.created_at:',
          task.created_at,
        )
        return task.created_at >= createdAfter
      })
    }

    if (createdBefore) {
      tasks = tasks.filter((task) => {
        console.log(
          'createdBefore:',
          createdBefore,
          'task.created_at:',
          task.created_at,
        )
        return task.created_at <= createdBefore
      })
    }

    // Additional filters
    if (hasDescription !== undefined) {
      tasks = tasks.filter((task) => {
        const taskHasDescription = Boolean(
          task.description && task.description.trim().length > 0,
        )
        return taskHasDescription === hasDescription
      })
    }

    if (overdue) {
      const now = new Date()
      tasks = tasks.filter((task) => {
        if (!task.due_date) return false
        return task.due_date < now && task.status !== 'DONE'
      })
    }

    // Sorting
    tasks = tasks.sort((a, b) => {
      let comparison = 0

      switch (orderBy) {
        case 'createdAt':
          comparison = a.created_at.getTime() - b.created_at.getTime()
          break
        case 'dueDate':
          if (!a.due_date && !b.due_date) comparison = 0
          else if (!a.due_date) comparison = 1
          else if (!b.due_date) comparison = -1
          else comparison = a.due_date.getTime() - b.due_date.getTime()
          break
        case 'priority': {
          const priorityOrder = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 }
          const aPriority =
            priorityOrder[a.priority as keyof typeof priorityOrder] || 0
          const bPriority =
            priorityOrder[b.priority as keyof typeof priorityOrder] || 0
          comparison = aPriority - bPriority
          break
        }
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
        default:
          comparison = b.created_at.getTime() - a.created_at.getTime()
      }

      return order === 'asc' ? comparison : -comparison
    })

    // Pagination
    const pageSize = 10
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedTasks = tasks.slice(startIndex, endIndex)

    // Include relations
    const tasksWithRelations: TaskWithRelations[] = paginatedTasks.map(
      (task) => ({
        ...task,
        category:
          this.categories.find((cat) => cat.id === task.category_id) || null,
        tags: this.taskTags
          .filter((taskTag) => taskTag.taskId === task.id)
          .map((taskTag) => this.tags.find((tag) => tag.id === taskTag.tagId))
          .filter((tag): tag is Tag => tag !== undefined),
      }),
    )

    return tasksWithRelations
  }

  async searchByText(params: FindManyParams) {
    const { userId, query, includeArchived = false, page = 1 } = params

    if (!query || query.trim().length < 2) {
      return []
    }

    let tasks = this.items.filter((task) => task.user_id === userId)

    if (!includeArchived) {
      tasks = tasks.filter((task) => !task.is_archived)
    }

    // Full-text search simulation
    const searchTerm = query.toLowerCase().trim()

    tasks = tasks.filter((task) => {
      const titleMatch = task.title.toLowerCase().includes(searchTerm)
      const descriptionMatch =
        task.description?.toLowerCase().includes(searchTerm) || false

      return titleMatch || descriptionMatch
    })

    // Prioritize title matches over description matches
    tasks = tasks.sort((a, b) => {
      const aTitleMatch = a.title.toLowerCase().includes(searchTerm)
      const bTitleMatch = b.title.toLowerCase().includes(searchTerm)

      if (aTitleMatch && !bTitleMatch) return -1
      if (!aTitleMatch && bTitleMatch) return 1

      // If both match similarly, sort by created_at descending
      return b.created_at.getTime() - a.created_at.getTime()
    })

    // Pagination
    const pageSize = 10
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize

    const paginatedTasks = tasks.slice(startIndex, endIndex)

    // Include relations
    const tasksWithRelations: TaskWithRelations[] = paginatedTasks.map(
      (task) => ({
        ...task,
        category:
          this.categories.find((cat) => cat.id === task.category_id) || null,
        tags: this.taskTags
          .filter((taskTag) => taskTag.taskId === task.id)
          .map((taskTag) => this.tags.find((tag) => tag.id === taskTag.tagId))
          .filter((tag): tag is Tag => tag !== undefined),
      }),
    )

    return tasksWithRelations
  }

  async findByCategoryId(categoryId: string) {
    return this.items.filter((item) => item.category_id === categoryId)
  }

  async delete(id: string) {
    const taskIndex = this.items.findIndex(
      (item) => item.id === id && !item.is_archived,
    )

    if (taskIndex === -1) {
      return null
    }

    const currentTask = this.items[taskIndex]

    const updatedTask: Task = {
      ...currentTask,
      is_archived: true,
      updated_at: new Date(),
    } as Task

    this.items[taskIndex] = updatedTask

    return updatedTask
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

  async updateWithTags(
    id: string,
    data: Prisma.TaskUpdateInput,
    tagIds: string[],
  ) {
    const task = await this.update(id, data)

    if (!task) {
      throw new ResourceNotFoundError()
    }

    this.taskTags = this.taskTags.filter((rel) => rel.taskId !== id)

    if (tagIds.length > 0) {
      for (const tagId of tagIds) {
        this.taskTags.push({ taskId: id, tagId })
      }
    }

    return task
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
      created_at: data.created_at ? new Date(data.created_at) : new Date(),
      updated_at: new Date(),
    }

    this.items.push(task)
    return task
  }
}
