import { useState, useEffect, useRef, useCallback } from 'react'
import TaskItem from './TaskItem.jsx'

const TaskList = ({ tasks = [], loading = false, onEdit, onDelete, onToggle }) => {
  const trackRef = useRef(null)
  const cardRef = useRef(null)
  const [cardWidth, setCardWidth] = useState(360)
  const [currentIndex, setCurrentIndex] = useState(0)

  const tasksCount = tasks.length

  // Measure card width for carousel
  useEffect(() => {
    const measureCardWidth = () => {
      const card = cardRef.current
      const track = trackRef.current
      if (!card || !track) return

      const cardRect = card.getBoundingClientRect()
      const trackStyles = getComputedStyle(track)
      const gap = parseInt(trackStyles.gap) || 16
      
      setCardWidth(cardRect.width + gap)
    }

    if (tasksCount > 0) {
      measureCardWidth()
      window.addEventListener('resize', measureCardWidth)
      return () => window.removeEventListener('resize', measureCardWidth)
    }
  }, [tasksCount])

  // Reset index when tasks change
  useEffect(() => {
    if (currentIndex >= tasksCount && tasksCount > 0) {
      setCurrentIndex(0)
    }
  }, [tasksCount, currentIndex])

  // Infinite navigation handlers
  const goToNext = useCallback(() => {
    if (tasksCount === 0) return
    setCurrentIndex(prev => (prev + 1) % tasksCount)
  }, [tasksCount])

  const goToPrev = useCallback(() => {
    if (tasksCount === 0) return
    setCurrentIndex(prev => (prev - 1 + tasksCount) % tasksCount)
  }, [tasksCount])

  const goToIndex = useCallback((index) => {
    if (tasksCount === 0) return
    setCurrentIndex(Math.max(0, Math.min(index, tasksCount - 1)))
  }, [tasksCount])

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowLeft') {
      goToPrev()
    } else if (e.key === 'ArrowRight') {
      goToNext()
    }
  }, [goToPrev, goToNext])

  // Loading state
  if (loading && tasksCount === 0) {
    return (
      <section className="task-list" aria-live="polite">
        <div className="empty" role="status">Loading tasks...</div>
      </section>
    )
  }

  // Empty state
  if (tasksCount === 0) {
    return (
      <section className="task-list">
        <div className="empty">
          <p>No tasks yet</p>
          <p className="empty-hint">Add your first task to get started!</p>
        </div>
      </section>
    )
  }

  // Always show carousel (even for single task)
  const translateX = -currentIndex * cardWidth

  return (
    <section 
      className="task-list"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="carousel" role="region" aria-label="Task carousel">
        
        {/* Navigation buttons - always enabled for infinite scroll */}
        <button
          type="button"
          className="carousel-btn carousel-btn-prev"
          onClick={goToPrev}
          aria-label="Previous task"
          disabled={tasksCount === 0}
        >
          ‹
        </button>

        <button
          type="button"
          className="carousel-btn carousel-btn-next"
          onClick={goToNext}
          aria-label="Next task"
          disabled={tasksCount === 0}
        >
          ›
        </button>

        {/* Carousel track */}
        <div 
          ref={trackRef}
          className="carousel-track"
          style={{ 
            transform: `translateX(${translateX}px)`,
            transition: 'transform 0.3s ease-in-out'
          }}
        >
          {tasks.map((task, index) => (
            <div 
              key={task.id}
              ref={index === 0 ? cardRef : null}
              className={`carousel-card ${index === currentIndex ? 'active' : ''}`}
              aria-hidden={index !== currentIndex}
            >
              <TaskItem 
                task={task} 
                onEdit={onEdit} 
                onDelete={onDelete} 
                onToggle={onToggle}
                busy={loading}
              />
            </div>
          ))}
        </div>

        {/* Indicators - show even for single task */}
        <div className="carousel-indicators" role="tablist">
          {tasks.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`indicator ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToIndex(index)}
              aria-label={`Go to task ${index + 1}`}
              role="tab"
              aria-selected={index === currentIndex}
            />
          ))}
        </div>

        {/* Task counter */}
        <div className="task-counter" aria-live="polite">
          {tasksCount === 1 ? (
            'Task 1 of 1'
          ) : (
            `Task ${currentIndex + 1} of ${tasksCount}`
          )}
        </div>
      </div>
    </section>
  )
}

export default TaskList