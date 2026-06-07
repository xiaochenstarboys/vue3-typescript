import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { pool } from '../config/db'
import { asyncHandler } from '../middleware/asyncHandler'
import type { DbRow } from '../types'

const router = Router()

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})

router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ code: 400, message: '参数错误', data: null })
    return
  }
  const { username, password } = parsed.data
  const [rows] = await pool.query<DbRow[]>('SELECT * FROM users WHERE username = ?', [username])
  const user = rows[0]
  if (!user || !(await bcrypt.compare(password, user.password as string))) {
    res.status(401).json({ code: 401, message: '用户名或密码错误', data: null })
    return
  }
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '7d' }
  )
  res.json({
    code: 200,
    message: 'ok',
    data: { token, user: { id: user.id, username: user.username, role: user.role, avatar: user.avatar } },
  })
}))

router.post('/logout', (_req, res) => {
  res.json({ code: 200, message: '已退出登录', data: null })
})

export default router
