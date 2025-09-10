
const BASE_URL = '/api/tasks'

async function request(path = '', { method = 'GET', body } = {}) {
  const url = `${BASE_URL}${path}`
  
  try {
    const res = await fetch(url, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })

    if (res.status === 204) return null
    
    const text = await res.text()
    const data = text ? safeJsonParse(text) : null

    if (!res.ok) {
      const msg = data?.error ?? data?.message ?? `${res.status} ${res.statusText}`
      const err = new Error(msg)
      err.status = res.status
      err.payload = data
      throw err
    }
    
    return data
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Failed to connect to server. Please check if the server is running.')
    }
    throw error
  }
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export const Api = {
  getAll: () => {
    return request('')
  },
  
  create: (payload) => {
    return request('', { method: 'POST', body: payload })
  },
  
  update: (id, payload) => {
    return request(`/${id}`, { method: 'PUT', body: payload })
  },
  
  remove: (id) => {
    return request(`/${id}`, { method: 'DELETE' })
  },
  
  toggle: (id) => {
    return request(`/${id}/toggle`, { method: 'PATCH' })
  },
}