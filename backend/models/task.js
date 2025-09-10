let tasks = []
let nextId = 1

const VALID_PRIORITIES = ['low', 'medium', 'high']

// Custom Error Classes
class TaskNotFoundError extends Error {
  constructor(message = 'Task not found') {
    super(message)
    this.name = 'TaskNotFoundError'
    this.statusCode = 404
  }
}

class ValidationError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ValidationError'
    this.statusCode = 400
  }
}

// Validation helper
const validateTaskData = (taskData, isUpdate = false) => {
  const errors = []
  
  // Title validation
  if (!isUpdate || taskData.hasOwnProperty('title')) {
    if (!taskData.title || typeof taskData.title !== 'string') {
      errors.push('Title is required and must be a string')
    } else if (taskData.title.trim().length === 0) {
      errors.push('Title cannot be empty')
    } else if (taskData.title.trim().length > 80) {
      errors.push('Title must be 80 characters or less')
    }
  }

  // Description validation
  if (taskData.hasOwnProperty('description')) {
    if (typeof taskData.description !== 'string') {
      errors.push('Description must be a string')
    } else if (taskData.description.length > 500) {
      errors.push('Description must be 500 characters or less')
    }
  }
  
  // Priority validation
  if (taskData.hasOwnProperty('priority')) {
    if (!VALID_PRIORITIES.includes(taskData.priority)) {
      errors.push(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}`)
    }
  }
  
  // Completed validation
  if (taskData.hasOwnProperty('completed')) {
    if (typeof taskData.completed !== 'boolean') {
      errors.push('Completed must be a boolean')
    }
  }
  
  return errors
}

// Task operations
const createTask = (taskData) => {
  const validationErrors = validateTaskData(taskData)
  if (validationErrors.length > 0) {
    throw new ValidationError(validationErrors.join('. '))
  }
  
  const task = {
    id: String(nextId++), // Convert to string
    title: taskData.title.trim(),
    description: taskData.description || '',
    priority: taskData.priority || 'low',
    completed: Boolean(taskData.completed),
    createdAt: new Date().toISOString()
  }
  
  tasks.push(task)
  return task
}

const getAllTasks = () => {
  return [...tasks]
}

const getTaskById = (id) => {
  const task = tasks.find(task => task.id === id)
  if (!task) {
    throw new TaskNotFoundError(`Task with ID ${id} not found`)
  }
  
  return task
}

const updateTask = (id, updateData) => {
  const existingTask = getTaskById(id) // This will throw if not found
  
  const validationErrors = validateTaskData(updateData, true)
  if (validationErrors.length > 0) {
    throw new ValidationError(validationErrors.join('. '))
  }
  
  const updatedTask = {
    ...existingTask,
    title: updateData.hasOwnProperty('title') ? updateData.title.trim() : existingTask.title,
    description: updateData.hasOwnProperty('description') ? updateData.description : existingTask.description,
    priority: updateData.hasOwnProperty('priority') ? updateData.priority : existingTask.priority,
    completed: updateData.hasOwnProperty('completed') ? Boolean(updateData.completed) : existingTask.completed
  }

  // Replace in array
  const taskIndex = tasks.findIndex(task => task.id === id)
  tasks[taskIndex] = updatedTask
  
  return updatedTask
}

const toggleTask = (id) => {
  const task = getTaskById(id)
  return updateTask(id, { completed: !task.completed })
}

const deleteTask = (id) => {
  const initialLength = tasks.length
  tasks = tasks.filter(task => task.id !== id)
  
  const wasDeleted = tasks.length < initialLength
  if (!wasDeleted) {
    throw new TaskNotFoundError(`Task with ID ${id} not found`)
  }
  
  return true
}

// Export custom errors for route handlers
export const errors = {
  TaskNotFoundError,
  ValidationError
}

export default {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  toggleTask,
  deleteTask
}