import express from 'express'
import cors from 'cors'
import tasksRouter from './routes/task.js'
import middleware from './middleware/middleware.js'

const app = express()

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
app.use(middleware.requestLogger)

app.use('/api/tasks', tasksRouter)

app.use(middleware.unknownEndpoint)

export default app