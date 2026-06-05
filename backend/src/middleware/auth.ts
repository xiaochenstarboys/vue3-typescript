import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { JwtPayload } from '../types'

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    res.status(401).json({ code: 401, message: '未授权，请先登录', data: null })
    return
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret') as JwtPayload
    req.user = payload
    next()
  } catch {
    res.status(401).json({ code: 401, message: 'Token 已过期或无效', data: null })
  }
}
