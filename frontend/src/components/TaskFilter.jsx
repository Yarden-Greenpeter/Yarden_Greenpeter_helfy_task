import React, { useCallback } from 'react'

const FILTERS = ['all', 'completed', 'pending']
const LABELS = { all: 'All', completed: 'Completed', pending: 'Pending' }

export default function TaskFilter({ value = 'all', onChange, disabled = false, counts }) {
  const handleClick = useCallback(
    (next) => () => { if (!disabled) onChange?.(next) },
    [onChange, disabled]
  )

  const handleKeyDown = useCallback((e) => {
    if (disabled) return
    const idx = FILTERS.indexOf(value)
    if (idx === -1) return
    if (e.key === 'ArrowRight') {
      onChange?.(FILTERS[(idx + 1) % FILTERS.length])
    } else if (e.key === 'ArrowLeft') {
      onChange?.(FILTERS[(idx - 1 + FILTERS.length) % FILTERS.length])
    }
  }, [value, onChange, disabled])

  const getCount = (k) => (counts && Number.isFinite(counts[k]) ? ` (${counts[k]})` : '')

  return (
    <div
      className="task-filter"
      role="toolbar"
      aria-label="Filter tasks"
      onKeyDown={handleKeyDown}
    >
      {FILTERS.map((f) => (
        <button
          key={f}
          type="button"
          className={`btn-filter ${value === f ? 'is-active' : ''}`}
          aria-pressed={value === f}
          onClick={handleClick(f)}
          disabled={disabled}
        >
          {LABELS[f]}{getCount(f)}
        </button>
      ))}
    </div>
  )
}
