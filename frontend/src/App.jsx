import React, { useEffect, useMemo, useState, useCallback } from 'react'
import TaskList from './components/TaskList.jsx'
import TaskForm from './components/TaskForm.jsx'
import TaskFilter from './components/TaskFilter.jsx'
import { Api } from './services/api.js'
import './styles/app.css'

export default function App() {
  const [tasks, setTasks] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editingTask, setEditingTask] = useState(null)

  // Load tasks on mount
  useEffect(() => {
    let cancelled = false
    
    const loadTasks = async () => {
      setLoading(true)
      try {
        const taskList = await Api.getAll()
        if (!cancelled) {
          setTasks(Array.isArray(taskList) ? taskList : [])
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || 'Failed to load tasks')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadTasks()
    
    return () => {
      cancelled = true
    }
  }, [])

  // Memoized task counts
  const counts = useMemo(() => ({
    all: tasks.length,
    completed: tasks.filter(task => task.completed).length,
    pending: tasks.filter(task => !task.completed).length
  }), [tasks])

  // Memoized filtered tasks
  const filteredTasks = useMemo(() => {
    switch (filter) {
      case 'completed':
        return tasks.filter(task => task.completed)
      case 'pending':
        return tasks.filter(task => !task.completed)
      default:
        return tasks
    }
  }, [tasks, filter])

  // Handle task creation
  const handleCreate = useCallback(async (formData) => {
    try {
      setLoading(true)
      setError('')
      const createdTask = await Api.create(formData)
      setTasks(prevTasks => [...prevTasks, createdTask])
      setFilter('all') // Show all tasks after creating
    } catch (err) {
      setError(err?.message || 'Failed to create task')
    } finally {
      setLoading(false)
    }
  }, [])

  // Handle task update
  const handleUpdate = useCallback(async (id, formData) => {
    try {
      setLoading(true)
      setError('')
      const updatedTask = await Api.update(id, formData)
      setTasks(prevTasks => 
        prevTasks.map(task => task.id === id ? updatedTask : task)
      )
      setEditingTask(null)
    } catch (err) {
      setError(err?.message || 'Failed to update task')
    } finally {
      setLoading(false)
    }
  }, [])

  // Handle task deletion
  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return
    }
    
    try {
      await Api.remove(id)
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id))
      // Clear editing if we're deleting the task being edited
      if (editingTask?.id === id) {
        setEditingTask(null)
      }
    } catch (err) {
      setError(err?.message || 'Failed to delete task')
    }
  }, [editingTask])

  // Handle task toggle
  const handleToggle = useCallback(async (id) => {
    try {
      const updatedTask = await Api.toggle(id)
      setTasks(prevTasks => 
        prevTasks.map(task => task.id === id ? updatedTask : task)
      )
    } catch (err) {
      setError(err?.message || 'Failed to toggle task')
    }
  }, [])

  // Start editing a task
  const startEdit = useCallback((id) => {
    const taskToEdit = tasks.find(task => task.id === id)
    if (taskToEdit) {
      setEditingTask(taskToEdit)
    }
  }, [tasks])

  // Cancel editing
  const cancelEdit = useCallback(() => {
    setEditingTask(null)
  }, [])

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Task Manager</h1>
      </header>

      {error && (
        <div className="form-error" role="alert" style={{ marginBottom: 12 }}>
          {error}
          <button 
            type="button" 
            onClick={() => setError('')}
            style={{ marginLeft: 8, background: 'none', border: 'none', color: 'inherit' }}
          >
            ×
          </button>
        </div>
      )}

      <main className="app-content">
        <TaskForm
          initialTask={editingTask}
          onSubmit={editingTask 
            ? (formData) => handleUpdate(editingTask.id, formData)
            : handleCreate
          }
          onCancel={editingTask ? cancelEdit : undefined}
          busy={loading}
        />

        <TaskFilter
          value={filter}
          onChange={setFilter}
          counts={counts}
          disabled={loading}
        />

        <TaskList
          tasks={filteredTasks}
          loading={loading}
          onEdit={startEdit}
          onDelete={handleDelete}
          onToggle={handleToggle}
        />
      </main>
    </div>
  )
}