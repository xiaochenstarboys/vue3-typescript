import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { pool } from '../config/db'
import { asyncHandler } from '../middleware/asyncHandler'
import { toCamelCase } from '../utils/toCamelCase'
import { authMiddleware } from '../middleware/auth'

const router = Router()
router.use(authMiddleware)

const deptSchema = z.object({
  name: z.string().min(1).max(50),
  leaderId: z.number().int().positive().optional(),
  parentId: z.number().int().positive().nullable().optional(),
})

function buildTree(list: any[], parentId: number | null = null): any[] {
  return list
    .filter((d) => d.parent_id === parentId)
    .map((d) => ({ ...d, children: buildTree(list, d.id) }))
}

router.get('/', asyncHandler(async (_req: Request, res: Response) => {
  const [rows] = await pool.query<any[]>(
    `SELECT d.*, e.name as leader_name,
      (SELECT COUNT(*) FROM employees WHERE department_id = d.id) as employee_count
     FROM departments d
     LEFT JOIN employees e ON d.leader_id = e.id
     ORDER BY d.id`
  )
  res.json({ code: 200, message: 'ok', data: toCamelCase(buildTree(rows)) })
}))

router.get('/flat', asyncHandler(async (_req: Request, res: Response) => {
  const [rows] = await pool.query<any[]>('SELECT id, name, parent_id FROM departments ORDER BY id')
  res.json({ code: 200, message: 'ok', data: toCamelCase(rows) })
}))

router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const [rows] = await pool.query<any[]>('SELECT * FROM departments WHERE id = ?', [req.params.id])
  if (!rows[0]) { res.status(404).json({ code: 404, message: '部门不存在', data: null }); return }
  res.json({ code: 200, message: 'ok', data: toCamelCase(rows[0]) })
}))

router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const parsed = deptSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ code: 400, message: parsed.error.errors[0].message, data: null }); return
  }
  const d = parsed.data
  const [result] = await pool.query<any>(
    'INSERT INTO departments (name, leader_id, parent_id) VALUES (?, ?, ?)',
    [d.name, d.leaderId ?? null, d.parentId ?? null]
  )
  res.status(201).json({ code: 201, message: '创建成功', data: { id: result.insertId } })
}))

router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const parsed = deptSchema.partial().safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ code: 400, message: parsed.error.errors[0].message, data: null }); return
  }
  const d = parsed.data
  const fields: string[] = []
  const params: unknown[] = []
  if (d.name !== undefined) { fields.push('name = ?'); params.push(d.name) }
  if (d.leaderId !== undefined) { fields.push('leader_id = ?'); params.push(d.leaderId) }
  if (d.parentId !== undefined) { fields.push('parent_id = ?'); params.push(d.parentId) }
  if (!fields.length) { res.status(400).json({ code: 400, message: '无更新字段', data: null }); return }
  params.push(req.params.id)
  await pool.query(`UPDATE departments SET ${fields.join(', ')} WHERE id = ?`, params)
  res.json({ code: 200, message: '更新成功', data: null })
}))

router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const [rows] = await pool.query<any[]>(
    'SELECT COUNT(*) as cnt FROM employees WHERE department_id = ?', [req.params.id]
  )
  if (rows[0].cnt > 0) {
    res.status(400).json({ code: 400, message: '该部门下有员工，无法删除', data: null }); return
  }
  await pool.query('DELETE FROM departments WHERE id = ?', [req.params.id])
  res.json({ code: 200, message: '删除成功', data: null })
}))

export default router
