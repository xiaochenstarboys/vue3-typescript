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
  const [[r1]] = await pool.query<DbRow[]>(`SELECT COUNT(*) AS total FROM rooms`)
  const [[r2]] = await pool.query<DbRow[]>(`SELECT COUNT(*) AS occupied FROM rooms WHERE status = 'occupied'`)
  const [[r3]] = await pool.query<DbRow[]>(
    `SELECT COUNT(*) AS today_check_ins FROM orders WHERE status = 'checked_in' AND check_in = CURDATE()`
  )
  const [[r4]] = await pool.query<DbRow[]>(
    `SELECT COALESCE(SUM(total_amount), 0) AS today_revenue FROM orders WHERE status = 'checked_out' AND check_out = CURDATE()`
  )

  const totalRooms = asNumber(r1?.total)
  const occupiedRooms = asNumber(r2?.occupied)
  const todayCheckIns = asNumber(r3?.today_check_ins)
  const todayRevenue = asNumber(r4?.today_revenue)
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0

  // 近 6 个月营收趋势：按入账月份聚合（以 check_in 所在月统计 total_amount，含 checked_in 与 checked_out）
  const [monthly] = await pool.query<DbRow[]>(
    `SELECT DATE_FORMAT(check_in, '%Y-%m') AS month,
            SUM(CASE WHEN status = 'checked_in' THEN total_amount ELSE 0 END) AS income,
            SUM(CASE WHEN status = 'checked_out' THEN total_amount ELSE 0 END) AS completed
     FROM orders
     WHERE status IN ('checked_in', 'checked_out')
       AND check_in >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
     GROUP BY DATE_FORMAT(check_in, '%Y-%m')
     ORDER BY month`
  )
  const monthlyRevenue = monthly.map((m) => ({
    month: String(m.month),
    income: asNumber(m.income),
    completed: asNumber(m.completed),
  }))

  // 各房型客房数占比
  const [dist] = await pool.query<DbRow[]>(
    `SELECT t.name, COUNT(r.id) AS room_count
     FROM room_types t
     LEFT JOIN rooms r ON r.type_id = t.id
     GROUP BY t.id, t.name
     ORDER BY t.base_price`
  )
  const roomTypeDistribution = dist.map((d) => ({
    name: String(d.name),
    value: asNumber(d.room_count),
  }))

  res.json({
    code: 200,
    message: 'ok',
    data: {
      totalRooms,
      occupiedRooms,
      occupancyRate,
      todayCheckIns,
      todayRevenue,
      monthlyRevenue,
      roomTypeDistribution,
    },
  })
}))

export default router
