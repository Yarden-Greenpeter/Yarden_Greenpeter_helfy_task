import React, { useEffect, useMemo, useState } from 'react'

const PRIORITIES = ['low', 'medium', 'high']
const TITLE_MAX_LENGTH = 80
const DESCRIPTION_MAX_LENGTH = 500

export default function TaskForm({ initialTask, onSubmit, onCancel, busy = false }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('low')
  const [error, setError] = useState('')

  // Update form when initialTask changes
  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title || '')
      setDescription(initialTask.description || '')
      setPriority(initialTask.priority || 'low')
    } else {
      // Reset form for new task
      setTitle('')
      setDescription('')
      setPriority('low')
    }
    setError('') // Clear any previous errors
  }, [initialTask])

  // Calculate characters remaining for title
  const titleCharsLeft = useMemo(() => {
    return TITLE_MAX_LENGTH - title.trim().length
  }, [title])

  // Validate form data
  const validateForm = () => {
    const trimmedTitle = title.trim()
    
    if (!trimmedTitle) {
      return "Title is required"
    }
    
    if (trimmedTitle.length > TITLE_MAX_LENGTH) {
      return `Title must be ${TITLE_MAX_LENGTH} characters or less`
    }
    
    if (!PRIORITIES.includes(priority)) {
      return "Invalid priority selected"
    }
    
    if (description.length > DESCRIPTION_MAX_LENGTH) {
      return `Description must be ${DESCRIPTION_MAX_LENGTH} characters or less`
    }
    
    return ''
  }

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault()
    
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }
    
    setError('')
    
    try {
      await onSubmit({
        title: title.trim(),
        description: description,
        priority: priority,
        completed: false // Default for new tasks
      })
      
      // Reset form when creating a new task
      if (!initialTask) {
        setTitle('')
        setDescription('')
        setPriority('low')
      }
    } catch (err) {
      setError(err?.message || 'Failed to save task')
    }
  }

  const isEditing = Boolean(initialTask)

  return (
    <form className="task-form" onSubmit={handleSubmit} noValidate>
      <div className="form-row">
        <label htmlFor="task-title">
          Title <span aria-hidden="true">*</span>
        </label>
        <input
          id="task-title"
          name="title"
          type="text"
          maxLength={TITLE_MAX_LENGTH}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task title"
          required
          aria-invalid={!!error}
          aria-describedby="title-chars-left"
          disabled={busy}
        />
        <small id="title-chars-left" className="muted">
          {titleCharsLeft} characters remaining
        </small>
      </div>

      <div className="form-row">
        <label htmlFor="task-description">Description</label>
        <textarea
          id="task-description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional task description..."
          rows={3}
          maxLength={DESCRIPTION_MAX_LENGTH}
          disabled={busy}
        />
        <small className="muted">
          {DESCRIPTION_MAX_LENGTH - description.length} characters remaining
        </small>
      </div>

      <div className="form-row">
        <label>Priority</label>
        <div className="priority-buttons">
          {PRIORITIES.map(priorityOption => (
            <button
              key={priorityOption}
              type="button"
              disabled={busy}
              className={`btn-filter ${priority === priorityOption ? "is-active" : ""}`}
              onClick={() => setPriority(priorityOption)}
            >
              {priorityOption.charAt(0).toUpperCase() + priorityOption.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}

      <div className="form-actions">
        {onCancel && (
          <button 
            type="button" 
            onClick={onCancel} 
            disabled={busy}
            className="btn-cancel"
          >
            Cancel
          </button>
        )}
        <button 
          type="submit" 
          disabled={busy}
          className="btn-primary"
        >
          {busy ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Task')}
        </button>
      </div>
    </form>
  )
}