import React, { useMemo } from 'react'

const DATE_FORMATTER = new Intl.DateTimeFormat(undefined, {
  year: 'numeric', 
  month: 'short', 
  day: '2-digit',
  hour: '2-digit', 
  minute: '2-digit'
})

const PRIORITY_CLASSES = {
  high: 'badge badge-high',
  medium: 'badge badge-medium',
  low: 'badge badge-low'
}

const TaskItem = ({ task, onEdit, onDelete, onToggle, busy = false }) => {
  const formattedDate = useMemo(() => {
    const created = new Date(task.createdAt)
    return {
      iso: created.toISOString(),
      display: DATE_FORMATTER.format(created)
    }
  }, [task.createdAt])

  const priorityClass = PRIORITY_CLASSES[task.priority] || PRIORITY_CLASSES.low

  const handleEdit = () => onEdit?.(task.id)
  const handleDelete = () => onDelete?.(task.id)
  const handleToggle = () => onToggle?.(task.id)

  return (
    <article 
      className={`task-item ${task.completed ? 'is-completed' : ''}`}
      aria-labelledby={`task-title-${task.id}`}
    >
      <header className="task-head">
        <span className="task-id">#{task.id}</span>
        <span className={priorityClass} aria-label={`Priority: ${task.priority}`}>
          {task.priority}
        </span>
      </header>

      <h3 id={`task-title-${task.id}`} className="task-title">
        {task.title}
      </h3>
      
      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <footer className="task-footer">
        <time 
          className="task-created-at" 
          dateTime={formattedDate.iso}
          title={`Created: ${formattedDate.display}`}
        >
          {formattedDate.display}
        </time>

        <div className="task-actions" role="group" aria-label="Task actions">
          <button 
            type="button" 
            onClick={handleToggle}
            disabled={busy}
            aria-label={`Mark task as ${task.completed ? 'incomplete' : 'complete'}`}
            className="btn btn-toggle"
          >
            {task.completed ? '↶' : '✓'}
          </button>
          
          <button 
            type="button" 
            onClick={handleEdit}
            disabled={busy}
            aria-label="Edit task"
            className="btn btn-edit"
          >
            Edit
          </button>
          
          <button 
            type="button" 
            onClick={handleDelete}
            disabled={busy}
            aria-label="Delete task"
            className="btn btn-delete btn-danger"
          >
            Delete
          </button>
        </div>
      </footer>
    </article>
  )
}

export default TaskItem
