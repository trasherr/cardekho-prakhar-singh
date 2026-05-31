import { Hono } from 'hono'
import { getRandomCars, getFormMetadata, filterCars } from '../controllers/cars'
import { authMiddleware } from '../middleware/auth'

const api = new Hono()

api.use('*', authMiddleware)
api.get('/random', getRandomCars)
api.get('/metadata', getFormMetadata)
api.post('/filter', filterCars)

export default api
