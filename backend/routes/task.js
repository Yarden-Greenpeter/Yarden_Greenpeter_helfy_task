import express from 'express'
import Task, { errors } from '../models/task.js'

const { TaskNotFoundError, ValidationError } = errors
const tasksRouter = express.Router()

// Error handler helper
const handleError = (error, res) => {
  if (error instanceof TaskNotFoundError) {
    return res.status(404).json({ 
      error: error.message,
      code: 'TASK_NOT_FOUND'
    })
  }
  
  if (error instanceof ValidationError) {
    return res.status(400).json({ 
      error: error.message,
      code: 'VALIDATION_ERROR'
    })
  }
  
  // Handle unexpected errors
  console.error('Unexpected error:', error)
  return res.status(500).json({ 
    error: 'Internal server error',
    code: 'INTERNAL_ERROR'
  })
}

// GET /api/tasks
tasksRouter.get('/', (request, response) => {
  try {
    const tasks = Task.getAllTasks()
    response.status(200).json(tasks)
  } catch (error) {
    handleError(error, response)
  }
})

// GET /api/tasks/:id
tasksRouter.get('/:id', (request, response) => {
  try {
    const task = Task.getTaskById(request.params.id)
    response.status(200).json(task)
  } catch (error) {
    handleError(error, response)
  }
})

// POST /api/tasks
tasksRouter.post('/', (request, response) => {
  try {
    if (!request.body || Object.keys(request.body).length === 0) {
      return response.status(400).json({
        error: 'Request body is required',
        code: 'MISSING_BODY'
      })
    }
    
    const task = Task.createTask(request.body)
    response.status(201).json(task)
  } catch (error) {
    handleError(error, response)
  }
})

// PUT /api/tasks/:id
tasksRouter.put('/:id', (request, response) => {
  try {
    if (!request.body || Object.keys(request.body).length === 0) {
      return response.status(400).json({
        error: 'Request body is required',
        code: 'MISSING_BODY'
      })
    }
    
    const updatedTask = Task.updateTask(request.params.id, request.body)
    response.status(200).json(updatedTask)
  } catch (error) {
    handleError(error, response)
  }
})

// PATCH /api/tasks/:id/toggle
tasksRouter.patch('/:id/toggle', (request, response) => {
  try {
    const toggledTask = Task.toggleTask(request.params.id)
    response.status(200).json(toggledTask)
  } catch (error) {
    handleError(error, response)
  }
})

// DELETE /api/tasks/:id
tasksRouter.delete('/:id', (request, response) => {
  try {
    Task.deleteTask(request.params.id)
    response.status(204).end()
  } catch (error) {
    handleError(error, response)
  }
})

export default tasksRouter