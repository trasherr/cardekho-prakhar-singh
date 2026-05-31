import { Hono } from 'hono'
import { register, login } from '../controllers/auth'

const api = new Hono()
api.post('/register', register)
api.post('/login', login)

export default api
