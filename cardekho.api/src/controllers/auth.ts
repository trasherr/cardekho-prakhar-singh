import { Context } from 'hono'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User'
import { HTTP_STATUS, ERROR_MESSAGES, AUTH_CONSTANTS } from '../constants'

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret'
const JWT_EXPIRES_IN = '24h'
const SALT_ROUNDS = 10

export async function register(c: Context) {
  try {
    const { email, password } = await c.req.json()
    if (!email || !password) return c.json({ error: ERROR_MESSAGES.MISSING_CREDENTIALS }, HTTP_STATUS.BAD_REQUEST)
    if (String(password).length < AUTH_CONSTANTS.MIN_PASSWORD_LENGTH) return c.json({ error: ERROR_MESSAGES.PASSWORD_TOO_SHORT }, HTTP_STATUS.BAD_REQUEST)

    const existing = await User.findOne({ email })
    if (existing) return c.json({ error: ERROR_MESSAGES.EMAIL_REGISTERED }, HTTP_STATUS.CONFLICT)

    const hashed = await bcrypt.hash(password, SALT_ROUNDS)
    const user = new User({ email, password: hashed })
    await user.save()

    const token = jwt.sign({ sub: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })

    return c.json({ token, user: { id: user._id, email: user.email } }, HTTP_STATUS.CREATED)
  } catch (err) {
    console.error(err)
    return c.json({ error: ERROR_MESSAGES.REGISTRATION_FAILED }, HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
}

export async function login(c: Context) {
  try {
    const { email, password } = await c.req.json()
    if (!email || !password) return c.json({ error: ERROR_MESSAGES.MISSING_CREDENTIALS }, HTTP_STATUS.BAD_REQUEST)

    const user = await User.findOne({ email })
    if (!user) return c.json({ error: ERROR_MESSAGES.INVALID_CREDENTIALS }, HTTP_STATUS.UNAUTHORIZED)

    const ok = await bcrypt.compare(password, user.password)
    if (!ok) return c.json({ error: ERROR_MESSAGES.INVALID_CREDENTIALS }, HTTP_STATUS.UNAUTHORIZED)

    const token = jwt.sign({ sub: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })

    return c.json({ token, user: { id: user._id, email: user.email } }, HTTP_STATUS.OK)
  } catch (err) {
    console.error(err)
    return c.json({ error: ERROR_MESSAGES.LOGIN_FAILED }, HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
}
