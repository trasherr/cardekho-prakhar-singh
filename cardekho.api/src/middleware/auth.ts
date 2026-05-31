import { Context } from 'hono'
import type { Next } from 'hono'
import { verifyToken } from '../utils/jwt'

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  const token = authHeader.split(' ')[1]
  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  const decoded = verifyToken(token)
  if (!decoded) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  c.set('user', decoded)
  await next()
}
