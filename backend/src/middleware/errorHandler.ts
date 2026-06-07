import { Request, Response, NextFunction } from 'express'

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error('[Error]', err.message)
  const status = (err as NodeJS.ErrnoException).code === 'ECONNREFUSED' ? 503 : 500
  res.status(status).json({ code: status, message: err.message || '服务器内部错误', data: null })
}
