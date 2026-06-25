import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { testConnection } from './config/db'
import { errorHandler } from './middleware/errorHandler'
import authRouter from './routes/auth'
import roomTypesRouter from './routes/roomTypes'
import roomsRouter from './routes/rooms'
import ordersRouter from './routes/orders'
import dashboardRouter from './routes/dashboard'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/auth', authRouter)
app.use('/api/room-types', roomTypesRouter)
app.use('/api/rooms', roomsRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/dashboard', dashboardRouter)

app.get('/health', (_req, res) => res.json({ status: 'ok' }))

app.use(errorHandler)

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))

testConnection()
  .then(() => console.log('MySQL connected'))
  .catch((err) => console.warn('⚠ MySQL not available, API will return errors:', err.message))
