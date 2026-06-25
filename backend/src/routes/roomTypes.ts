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

const roomTypeSchema = z.object({
  name: z.string().min(1).max(50),
  basePrice: z.number().positive(),
  bedType: z.string().min(1).max(30),
  area: z.number().positive().optional(),
  maxGuests: z.number().int().positive(),
  description: z.string().max(255).optional(),
})

// 列表：附带该房型的客房总数 / 空闲数
router.get('/', asyncHandler(async (_req: Request, res: Response) => {
  const [rows] = await pool.query<DbRow[]>(
    `SELECT t.*,
       (SELECT COUNT(*) FROM rooms r WHERE r.type_id = t.id) AS room_count,
       (SELECT COUNT(*) FROM rooms r WHERE r.type_id = t.id AND r.status = 'available') AS available_count
     FROM room_types t
     ORDER BY t.base_price`
  )
  res.json({ code: 200, message: 'ok', data: toCamelCase(rows) })
}))

router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const [rows] = await pool.query<DbRow[]>('SELECT * FROM room_types WHERE id = ?', [req.params.id])
  if (!rows[0]) {
    res.status(404).json({ code: 404, message: '房型不存在', data: null })
    return
  }
  res.json({ code: 200, message: 'ok', data: toCamelCase(rows[0]) })
}))

router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const parsed = roomTypeSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ code: 400, message: parsed.error.errors[0].message, data: null })
    return
  }
  const d = parsed.data
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO room_types (name, base_price, bed_type, area, max_guests, description)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [d.name, d.basePrice, d.bedType, d.area ?? null, d.maxGuests, d.description ?? null]
  )
  res.status(201).json({ code: 201, message: '创建成功', data: { id: result.insertId } })
}))

router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const parsed = roomTypeSchema.partial().safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ code: 400, message: parsed.error.errors[0].message, data: null })
    return
  }
  const d = parsed.data
  const fields: string[] = []
  const params: unknown[] = []
  const map: Record<string, unknown> = {
    name: d.name,
    base_price: d.basePrice,
    bed_type: d.bedType,
    area: d.area,
    max_guests: d.maxGuests,
    description: d.description,
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
  await pool.query(`UPDATE room_types SET ${fields.join(', ')} WHERE id = ?`, params)
  res.json({ code: 200, message: '更新成功', data: null })
}))

router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const [rows] = await pool.query<DbRow[]>(
    'SELECT COUNT(*) as cnt FROM rooms WHERE type_id = ?', [req.params.id]
  )
  if (Number(rows[0].cnt) > 0) {
    res.status(400).json({ code: 400, message: '该房型下有客房，无法删除', data: null })
    return
  }
  await pool.query('DELETE FROM room_types WHERE id = ?', [req.params.id])
  res.json({ code: 200, message: '删除成功', data: null })
}))

export default router
