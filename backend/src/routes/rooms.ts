import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { pool } from '../config/db'
import { asyncHandler } from '../middleware/asyncHandler'
import { authMiddleware } from '../middleware/auth'
import { toCamelCase } from '../utils/toCamelCase'
import type { DbRow } from '../types'
import type { ResultSetHeader } from 'mysql2'

const router = Router()
router.use(authMiddleware)

const roomSchema = z.object({
  roomNumber: z.string().min(1).max(10),
  floor: z.number().int().positive(),
  typeId: z.number().int().positive(),
  status: z.enum(['available', 'occupied', 'dirty', 'maintenance']).optional(),
})

// 列表（可按房型/房号/房态过滤），join 房型
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { typeId, keyword, status, floor } = req.query
  const conditions: string[] = []
  const params: unknown[] = []
  if (typeId) {
    conditions.push('r.type_id = ?')
    params.push(Number(typeId))
  }
  if (keyword) {
    conditions.push('r.room_number LIKE ?')
    params.push(`%${keyword}%`)
  }
  if (status) {
    conditions.push('r.status = ?')
    params.push(status)
  }
  if (floor) {
    conditions.push('r.floor = ?')
    params.push(Number(floor))
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const [rows] = await pool.query<DbRow[]>(
    `SELECT r.*, t.name AS type_name, t.base_price
     FROM rooms r
     LEFT JOIN room_types t ON r.type_id = t.id
     ${where}
     ORDER BY r.floor, r.room_number`,
    params
  )
  res.json({ code: 200, message: 'ok', data: toCamelCase(rows) })
}))

router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const parsed = roomSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ code: 400, message: parsed.error.errors[0].message, data: null })
    return
  }
  const d = parsed.data
  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO rooms (room_number, floor, type_id, status) VALUES (?, ?, ?, ?)',
    [d.roomNumber, d.floor, d.typeId, d.status ?? 'available']
  )
  res.status(201).json({ code: 201, message: '创建成功', data: { id: result.insertId } })
}))

router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const parsed = roomSchema.partial().safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ code: 400, message: parsed.error.errors[0].message, data: null })
    return
  }
  const d = parsed.data
  const fields: string[] = []
  const params: unknown[] = []
  const map: Record<string, unknown> = {
    room_number: d.roomNumber,
    floor: d.floor,
    type_id: d.typeId,
    status: d.status,
  }
  for (const [k, v] of Object.entries(map)) {
    if (v !== undefined) {
      fields.push(`${k} = ?`)
      params.push(v)
    }
  }
  if (!fields.length) {
    res.status(400).json({ code: 400, message: '无更新字段', data: null })
    return
  }
  params.push(req.params.id)
  await pool.query(`UPDATE rooms SET ${fields.join(', ')} WHERE id = ?`, params)
  res.json({ code: 200, message: '更新成功', data: null })
}))

// 改房态（清扫完成等场景手动切换）
router.patch('/:id/status', asyncHandler(async (req: Request, res: Response) => {
  const parsed = z.object({ status: z.enum(['available', 'occupied', 'dirty', 'maintenance']) }).safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ code: 400, message: parsed.error.errors[0].message, data: null })
    return
  }
  await pool.query('UPDATE rooms SET status = ? WHERE id = ?', [parsed.data.status, req.params.id])
  res.json({ code: 200, message: '房态已更新', data: null })
}))

router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const [rows] = await pool.query<DbRow[]>(
    'SELECT COUNT(*) as cnt FROM orders WHERE room_id = ?', [req.params.id]
  )
  if (Number(rows[0].cnt) > 0) {
    res.status(400).json({ code: 400, message: '该客房存在历史订单，无法删除', data: null })
    return
  }
  await pool.query('DELETE FROM rooms WHERE id = ?', [req.params.id])
  res.json({ code: 200, message: '删除成功', data: null })
}))

export default router
