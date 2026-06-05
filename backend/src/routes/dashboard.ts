import { Router, Request, Response } from 'express'
import { pool } from '../config/db'
import { asyncHandler } from '../middleware/asyncHandler'
import { authMiddleware } from '../middleware/auth'

const router = Router()
router.use(authMiddleware)

router.get('/stats', asyncHandler(async (_req: Request, res: Response) => {
  const [[{ total }]] = await pool.query<any[]>(`SELECT COUNT(*) as total FROM employees`)
  const [[{ deptCount }]] = await pool.query<any[]>(`SELECT COUNT(*) as deptCount FROM departments`)
  const [[{ monthlyHires }]] = await pool.query<any[]>(
    `SELECT COUNT(*) as monthlyHires FROM employees WHERE MONTH(entry_date) = MONTH(CURDATE()) AND YEAR(entry_date) = YEAR(CURDATE())`
  )
  const [[{ inactive }]] = await pool.query<any[]>(
    `SELECT COUNT(*) as inactive FROM employees WHERE status = 'inactive'`
  )

  const turnoverRate = total > 0 ? Math.round((inactive / total) * 100) : 0

  res.json({
    code: 200,
    message: 'ok',
    data: {
      totalEmployees: Number(total),
      departmentCount: Number(deptCount),
      monthlyHires: Number(monthlyHires),
      inactiveCount: Number(inactive),
      turnoverRate,
    },
  })
}))

export default router
