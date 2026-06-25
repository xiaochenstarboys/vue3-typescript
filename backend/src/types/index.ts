import type { RowDataPacket } from 'mysql2'

/** MySQL SELECT 查询返回的原始行类型（snake_case 列名） */
export interface DbRow extends RowDataPacket {
  [column: string]: unknown
}

export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

/** 订单分页查询参数 */
export interface PageQuery {
  page: number
  pageSize: number
  keyword?: string
  /** 按房型筛选（关联该房型的客房） */
  roomTypeId?: number
  /** 按订单状态筛选 */
  status?: string
}

export interface JwtPayload {
  id: number
  username: string
  role: string
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}
