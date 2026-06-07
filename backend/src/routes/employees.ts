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

const employeeSchema = z.object({
  name: z.string().min(1).max(50),
  gender: z.enum(['male', 'female']),
  departmentId: z.number().int().positive(),
  position: z.string().min(1).max(100),
  salary: z.number().positive(),
  entryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(['active', 'inactive', 'probation']),
  email: z.string().email(),
  phone: z.string().regex(/^1[3-9]\d{9}$/),
  avatar: z.string().optional(),
})

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, pageSize = 10, keyword, departmentId, status } = req.query as unknown as PageQuery
  const offset = (Number(page) - 1) * Number(pageSize)
  const conditions: string[] = []
  const params: unknown[] = []

  if (keyword) {
    conditions.push('(e.name LIKE ? OR e.email LIKE ? OR e.phone LIKE ?)')
    params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`)
  }
  if (departmentId) {
    conditions.push('e.department_id = ?')
    params.push(Number(departmentId))
  }
  if (status) {
    conditions.push('e.status = ?')
    params.push(status)
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const [countRows] = await pool.query<DbRow[]>(
    `SELECT COUNT(*) as total FROM employees e ${where}`,
    params
  )
  const total = countRows[0].total

  const [rows] = await pool.query<DbRow[]>(
    `SELECT e.*, d.name as department_name
     FROM employees e
     LEFT JOIN departments d ON e.department_id = d.id
     ${where} ORDER BY e.created_at DESC LIMIT ? OFFSET ?`,
    [...params, Number(pageSize), offset]
  )

  res.json({ code: 200, message: 'ok', data: { list: toCamelCase(rows), total, page: Number(page), pageSize: Number(pageSize) } })
}))

router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const [rows] = await pool.query<DbRow[]>(
    `SELECT e.*, d.name as department_name FROM employees e
     LEFT JOIN departments d ON e.department_id = d.id WHERE e.id = ?`,
    [req.params.id]
  )
  if (!rows[0]) { res.status(404).json({ code: 404, message: '员工不存在', data: null }); return }
  res.json({ code: 200, message: 'ok', data: toCamelCase(rows[0]) })
}))

router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const parsed = employeeSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ code: 400, message: parsed.error.errors[0].message, data: null })
    return
  }
  const d = parsed.data
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO employees (name, gender, department_id, position, salary, entry_date, status, email, phone, avatar)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [d.name, d.gender, d.departmentId, d.position, d.salary, d.entryDate, d.status, d.email, d.phone, d.avatar ?? null]
  )
  res.status(201).json({ code: 201, message: '创建成功', data: { id: result.insertId } })
}))

router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const parsed = employeeSchema.partial().safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ code: 400, message: parsed.error.errors[0].message, data: null })
    return
  }
  const d = parsed.data
  const fields: string[] = []
  const params: unknown[] = []
  const map: Record<string, unknown> = {
    name: d.name, gender: d.gender, department_id: d.departmentId,
    position: d.position, salary: d.salary, entry_date: d.entryDate,
    status: d.status, email: d.email, phone: d.phone, avatar: d.avatar,
  }
  for (const [k, v] of Object.entries(map)) {
    if (v !== undefined) { fields.push(`${k} = ?`); params.push(v) }
  }
  if (!fields.length) { res.status(400).json({ code: 400, message: '无更新字段', data: null }); return }
  params.push(req.params.id)
  await pool.query(`UPDATE employees SET ${fields.join(', ')} WHERE id = ?`, params)
  res.json({ code: 200, message: '更新成功', data: null })
}))

router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  await pool.query('DELETE FROM employees WHERE id = ?', [req.params.id])
  res.json({ code: 200, message: '删除成功', data: null })
}))

router.delete('/', asyncHandler(async (req: Request, res: Response) => {
  const { ids } = req.body as { ids: number[] }
  if (!Array.isArray(ids) || !ids.length) {
    res.status(400).json({ code: 400, message: 'ids 不能为空', data: null }); return
  }
  const placeholders = ids.map(() => '?').join(',')
  await pool.query(`DELETE FROM employees WHERE id IN (${placeholders})`, ids)
  res.json({ code: 200, message: `已删除 ${ids.length} 条记录`, data: null })
}))

export default router
