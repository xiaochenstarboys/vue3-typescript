import { Router, Request, Response } from 'express'
import { pool } from '../config/db'
import { asyncHandler } from '../middleware/asyncHandler'
import { authMiddleware } from '../middleware/auth'
import type { DbRow } from '../types'

const router = Router()
router.use(authMiddleware)

function asNumber(val: unknown): number {
  return Number(val ?? 0)
}

router.get('/stats', asyncHandler(async (_req: Request, res: Response) => {
  const [[row1]] = await pool.query<DbRow[]>(`SELECT COUNT(*) as total FROM employees`)
  const [[row2]] = await pool.query<DbRow[]>(`SELECT COUNT(*) as deptCount FROM departments`)
  const [[row3]] = await pool.query<DbRow[]>(
    `SELECT COUNT(*) as monthlyHires FROM employees WHERE MONTH(entry_date) = MONTH(CURDATE()) AND YEAR(entry_date) = YEAR(CURDATE())`
  )
  const [[row4]] = await pool.query<DbRow[]>(
    `SELECT COUNT(*) as inactive FROM employees WHERE status = 'inactive'`
  )

  const total = asNumber(row1?.total)
  const deptCount = asNumber(row2?.deptCount)
  const monthlyHires = asNumber(row3?.monthlyHires)
  const inactive = asNumber(row4?.inactive)
  const turnoverRate = total > 0 ? Math.round((inactive / total) * 100) : 0

  res.json({
    code: 200,
    message: 'ok',
    data: { totalEmployees: total, departmentCount: deptCount, monthlyHires, inactiveCount: inactive, turnoverRate },
  })
}))

export default router
