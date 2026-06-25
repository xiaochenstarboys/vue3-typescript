import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { pool } from '../config/db'
import { asyncHandler } from '../middleware/asyncHandler'
import { authMiddleware } from '../middleware/auth'
import { toCamelCase } from '../utils/toCamelCase'
import { PageQuery, type DbRow } from '../types'
import type { ResultSetHeader } from 'mysql2'

const router = Router()
router.use(authMiddleware)

const orderSchema = z.object({
  guestName: z.string().min(1).max(50),
  guestPhone: z.string().regex(/^1[3-9]\d{9}$/),
  guestIdCard: z.string().max(18).optional(),
  roomId: z.number().int().positive(),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  deposit: z.number().min(0).optional(),
  remark: z.string().max(255).optional(),
})

/** 生成订单号：HC + YYYYMMDD + 4 位序号 */
async function genOrderNo(): Promise<string> {
  const today = new Date()
  const ymd = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`
  const [rows] = await pool.query<DbRow[]>(
    `SELECT COUNT(*) AS cnt FROM orders WHERE DATE(created_at) = CURDATE()`
  )
  const seq = String(Number(rows[0].cnt) + 1).padStart(4, '0')
  return `HC${ymd}${seq}`
}

/** 日期区间重叠校验：同房存在 reserved/checked_in 且与 [checkIn, checkOut) 相交则冲突 */
async function hasDateConflict(roomId: number, checkIn: string, checkOut: string, excludeOrderId?: number): Promise<boolean> {
  const [rows] = await pool.query<DbRow[]>(
    `SELECT 1 FROM orders
     WHERE room_id = ?
       AND status IN ('reserved', 'checked_in')
       AND id <> ?
       AND check_in < ? AND check_out > ?
     LIMIT 1`,
    [roomId, excludeOrderId ?? 0, checkOut, checkIn]
  )
  return rows.length > 0
}

// 列表（分页 + 搜索 + 房型/状态筛选）
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, pageSize = 10, keyword, roomTypeId, status } = req.query as unknown as PageQuery
  const offset = (Number(page) - 1) * Number(pageSize)
  const conditions: string[] = []
  const params: unknown[] = []

  if (keyword) {
    conditions.push('(o.guest_name LIKE ? OR o.order_no LIKE ? OR o.guest_phone LIKE ?)')
    params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`)
  }
  if (roomTypeId) {
    conditions.push('r.type_id = ?')
    params.push(Number(roomTypeId))
  }
  if (status) {
    conditions.push('o.status = ?')
    params.push(status)
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const [countRows] = await pool.query<DbRow[]>(
    `SELECT COUNT(*) AS total
     FROM orders o LEFT JOIN rooms r ON o.room_id = r.id
     ${where}`,
    params
  )
  const total = countRows[0].total

  const [rows] = await pool.query<DbRow[]>(
    `SELECT o.*, r.room_number, r.type_id, t.name AS type_name, t.base_price
     FROM orders o
     LEFT JOIN rooms r ON o.room_id = r.id
     LEFT JOIN room_types t ON r.type_id = t.id
     ${where}
     ORDER BY o.created_at DESC LIMIT ? OFFSET ?`,
    [...params, Number(pageSize), offset]
  )

  res.json({
    code: 200, message: 'ok',
    data: { list: toCamelCase(rows), total, page: Number(page), pageSize: Number(pageSize) },
  })
}))

router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const [rows] = await pool.query<DbRow[]>(
    `SELECT o.*, r.room_number, r.type_id, t.name AS type_name, t.base_price
     FROM orders o
     LEFT JOIN rooms r ON o.room_id = r.id
     LEFT JOIN room_types t ON r.type_id = t.id
     WHERE o.id = ?`,
    [req.params.id]
  )
  if (!rows[0]) {
    res.status(404).json({ code: 404, message: '订单不存在', data: null })
    return
  }
  res.json({ code: 200, message: 'ok', data: toCamelCase(rows[0]) })
}))

// 创建订单（reserved）：日期顺序校验 + 同房冲突校验 + 自动算价
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const parsed = orderSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ code: 400, message: parsed.error.errors[0].message, data: null })
    return
  }
  const d = parsed.data
  const checkInDate = new Date(d.checkIn)
  const checkOutDate = new Date(d.checkOut)
  if (checkOutDate <= checkInDate) {
    res.status(400).json({ code: 400, message: '退房日期需晚于入住日期', data: null })
    return
  }
  // 同房日期冲突校验
  if (await hasDateConflict(d.roomId, d.checkIn, d.checkOut)) {
    res.status(400).json({ code: 400, message: '该房间在此日期已被占用', data: null })
    return
  }
  // 取房型房价 + 计算天数与总价
  const [roomRows] = await pool.query<DbRow[]>(
    `SELECT r.type_id, t.base_price FROM rooms r
     JOIN room_types t ON r.type_id = t.id WHERE r.id = ?`,
    [d.roomId]
  )
  if (!roomRows[0]) {
    res.status(400).json({ code: 400, message: '客房不存在', data: null })
    return
  }
  const basePrice = Number(roomRows[0].base_price)
  const nights = Math.round((checkOutDate.getTime() - checkInDate.getTime()) / 86400000)
  const totalAmount = nights * basePrice
  const orderNo = await genOrderNo()

  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO orders
       (order_no, guest_name, guest_phone, guest_id_card, room_id, check_in, check_out, nights, total_amount, deposit, status, remark)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'reserved', ?)`,
    [orderNo, d.guestName, d.guestPhone, d.guestIdCard ?? null, d.roomId, d.checkIn, d.checkOut, nights, totalAmount, d.deposit ?? 0, d.remark ?? null]
  )
  res.status(201).json({ code: 201, message: '预订成功', data: { id: result.insertId, orderNo, totalAmount } })
}))

// 修改订单（仅 reserved 可改，且重新校验日期冲突）
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const [exist] = await pool.query<DbRow[]>('SELECT status FROM orders WHERE id = ?', [req.params.id])
  if (!exist[0]) {
    res.status(404).json({ code: 404, message: '订单不存在', data: null })
    return
  }
  if (exist[0].status !== 'reserved') {
    res.status(400).json({ code: 400, message: '仅已预订订单可修改', data: null })
    return
  }
  const parsed = orderSchema.partial().safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ code: 400, message: parsed.error.errors[0].message, data: null })
    return
  }
  const d = parsed.data
  const orderId = Number(req.params.id)

  // 若入住/退房/房间发生变化，重新校验冲突并重算天数与总价
  let recomputed: { nights: number; total: number } | null = null
  if (d.roomId !== undefined || d.checkIn !== undefined || d.checkOut !== undefined) {
    const [cur] = await pool.query<DbRow[]>('SELECT * FROM orders WHERE id = ?', [orderId])
    const roomId = d.roomId ?? Number(cur[0].room_id)
    const checkIn = d.checkIn ?? String(cur[0].check_in)
    const checkOut = d.checkOut ?? String(cur[0].check_out)
    const ci = new Date(checkIn), co = new Date(checkOut)
    if (co <= ci) {
      res.status(400).json({ code: 400, message: '退房日期需晚于入住日期', data: null })
      return
    }
    if (await hasDateConflict(roomId, checkIn, checkOut, orderId)) {
      res.status(400).json({ code: 400, message: '该房间在此日期已被占用', data: null })
      return
    }
    const [rt] = await pool.query<DbRow[]>(
      `SELECT t.base_price FROM rooms r JOIN room_types t ON r.type_id = t.id WHERE r.id = ?`, [roomId]
    )
    const nights = Math.round((co.getTime() - ci.getTime()) / 86400000)
    recomputed = { nights, total: nights * Number(rt[0].base_price) }
  }

  const fields: string[] = []
  const params: unknown[] = []
  const map: Record<string, unknown> = {
    guest_name: d.guestName,
    guest_phone: d.guestPhone,
    guest_id_card: d.guestIdCard,
    room_id: d.roomId,
    check_in: d.checkIn,
    check_out: d.checkOut,
    deposit: d.deposit,
    remark: d.remark,
  }
  for (const [k, v] of Object.entries(map)) {
    if (v !== undefined) {
      fields.push(`${k} = ?`)
      params.push(v)
    }
  }
  if (recomputed) {
    fields.push('nights = ?', 'total_amount = ?')
    params.push(recomputed.nights, recomputed.total)
  }
  if (!fields.length) {
    res.status(400).json({ code: 400, message: '无更新字段', data: null })
    return
  }
  params.push(orderId)
  await pool.query(`UPDATE orders SET ${fields.join(', ')} WHERE id = ?`, params)
  res.json({ code: 200, message: '修改成功', data: null })
}))

// 办理入住：订单 checked_in + 客房 occupied
router.post('/:id/check-in', asyncHandler(async (req: Request, res: Response) => {
  const [rows] = await pool.query<DbRow[]>('SELECT * FROM orders WHERE id = ?', [req.params.id])
  if (!rows[0]) {
    res.status(404).json({ code: 404, message: '订单不存在', data: null })
    return
  }
  if (rows[0].status !== 'reserved') {
    res.status(400).json({ code: 400, message: '仅已预订订单可办理入住', data: null })
    return
  }
  await pool.query('UPDATE orders SET status = ? WHERE id = ?', ['checked_in', req.params.id])
  await pool.query('UPDATE rooms SET status = ? WHERE id = ?', ['occupied', rows[0].room_id])
  res.json({ code: 200, message: '已办理入住', data: null })
}))

// 办理退房：订单 checked_out + 客房 dirty（待保洁）
router.post('/:id/check-out', asyncHandler(async (req: Request, res: Response) => {
  const [rows] = await pool.query<DbRow[]>('SELECT * FROM orders WHERE id = ?', [req.params.id])
  if (!rows[0]) {
    res.status(404).json({ code: 404, message: '订单不存在', data: null })
    return
  }
  if (rows[0].status !== 'checked_in') {
    res.status(400).json({ code: 400, message: '仅已入住订单可办理退房', data: null })
    return
  }
  await pool.query('UPDATE orders SET status = ? WHERE id = ?', ['checked_out', req.params.id])
  await pool.query('UPDATE rooms SET status = ? WHERE id = ?', ['dirty', rows[0].room_id])
  res.json({ code: 200, message: '已办理退房', data: null })
}))

// 取消订单：reserved 直接取消；checked_in 释放房间为 dirty
router.post('/:id/cancel', asyncHandler(async (req: Request, res: Response) => {
  const [rows] = await pool.query<DbRow[]>('SELECT * FROM orders WHERE id = ?', [req.params.id])
  if (!rows[0]) {
    res.status(404).json({ code: 404, message: '订单不存在', data: null })
    return
  }
  const status = rows[0].status as string
  if (status === 'cancelled' || status === 'checked_out') {
    res.status(400).json({ code: 400, message: '该订单状态不可取消', data: null })
    return
  }
  await pool.query('UPDATE orders SET status = ? WHERE id = ?', ['cancelled', req.params.id])
  if (status === 'checked_in') {
    await pool.query('UPDATE rooms SET status = ? WHERE id = ?', ['dirty', rows[0].room_id])
  }
  res.json({ code: 200, message: '已取消订单', data: null })
}))

router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  await pool.query('DELETE FROM orders WHERE id = ?', [req.params.id])
  res.json({ code: 200, message: '删除成功', data: null })
}))

// 批量删除
router.delete('/', asyncHandler(async (req: Request, res: Response) => {
  const { ids } = req.body as { ids: number[] }
  if (!Array.isArray(ids) || !ids.length) {
    res.status(400).json({ code: 400, message: 'ids 不能为空', data: null })
    return
  }
  const placeholders = ids.map(() => '?').join(',')
  await pool.query(`DELETE FROM orders WHERE id IN (${placeholders})`, ids)
  res.json({ code: 200, message: `已删除 ${ids.length} 条记录`, data: null })
}))

export default router
