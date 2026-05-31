import 'dotenv/config'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import authRoutes from './routes/auth'
import carRoutes from './routes/cars'
import { connectDB } from './config/mongo'
import { seed } from './scripts/seed'
import { serveStatic } from 'hono/bun'

const app = new Hono()

app.use('/api/*', cors({
  origin: 'http://localhost:4200',
}))

app.route('/api/v1/auth', authRoutes)
app.route('/api/v1/cars', carRoutes)

app.use('/*', serveStatic({ root: './public' }))
app.get('/', serveStatic({ path: './public/index.html' }))
// Connect DB (if configured)
await connectDB().catch((e) => console.error('DB connect failed', e))
await seed();

export default app
