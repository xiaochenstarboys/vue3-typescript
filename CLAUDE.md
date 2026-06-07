# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

公司管理项目 — Vue 3 + TS + Vite + Element Plus 前端，Express + TS + MySQL 后端。

## 常用命令

```bash
# 数据库
mysql -u root -p < backend/sql/init.sql

# 后端（两个终端分别启动）
cd backend && npm run dev      # → localhost:3000
cd frontend && npm run dev     # → localhost:5173（proxy /api → :3000）

# 前端检查
npm run lint                   # ESLint 自动修复
npm run type-check             # vue-tsc 类型检查
npm run build                  # 类型检查 + Vite 构建
```

## 架构设计

### 响应格式 & 请求层

API 统一返回 `{ code, message, data }`。前端 `request.ts` 响应拦截器自动解包 `data` 字段——调用方拿到的就是已解包的类型。code 非 200/201 触发 `ElMessage.error`。

`get/post/put/del` 是 async 泛型函数，通过 `instance.get<ApiResponse<T>>` + `as unknown as Promise<T>` 桥接类型。拦截器在内部将 `data` 转为 `AxiosResponse` 以满足 Axios 类型约束。

### 前端数据流：Composables 为主（无 Vuex 业务状态）

```
views → composables → api → request.ts → /api
```

- **`store/`** — 仅 `auth` 模块（token / user），持久化到 localStorage。employee / department 的 Vuex 模块**已删除**。
- **`composables/`** — 视图层唯一数据入口。`useEmployee` / `useDepartment` 各自管理 `ref` 状态（`list/total/loading/query`），内部直接调用 `api/`。视图组件不调 API。
- **`api/`** — 每个领域导出 API 对象（`employeeApi` 等），调用 `request.ts` 泛型方法并声明返回类型。

### 后端路由层

每个资源独立 Router 文件，关键约定：

- **异步处理**：所有 async handler 用 `asyncHandler(fn)` 包裹——捕获 reject 并转发 `errorHandler`。**禁止**在路由内写 try-catch。
- **认证**：`router.use(authMiddleware)` 全局启用 JWT（auth 路由除外）。
- **校验**：Zod `safeParse`，失败返回 `{ code: 400, message: errors[0].message }`。
- **DB 类型**：SELECT 用 `pool.query<DbRow[]>`（`DbRow extends RowDataPacket`），INSERT/UPDATE/DELETE 用 `pool.query<ResultSetHeader>`，禁止 `any`。
- **字段转换**：MySQL snake_case → `toCamelCase()` → 返回 camelCase。写入时路由层手写 snake_case 映射。

### 主题系统

- CSS 自定义属性 `data-theme="dark|light"`，`index.html` 有**内联脚本**在 Vue 挂载前读取 localStorage 设置 `data-theme`，消除白屏闪烁。
- `variables.less` 定义 Less 变量（`@primary` 等），fallback 为暗色主题值；通过 Vite `additionalData` 自动注入所有组件。
- `theme.less` 分暗/亮两块：CSS 变量 + Element Plus 组件覆盖（`.el-table`、`.el-input` 等），亮色块所有关键文字色都加了 `!important` 防止 EP 默认样式覆盖。
- RGB 三元组变量（`--primary-rgb` 等）用于 `rgba(var(--primary-rgb), opacity)` 场景——CSS 的 `rgba()` 不能直接传 hex 变量。
- 专用 token：`--avatar-shadow`、`--skeleton-base/shine`、`--table-hover-bg` 等，禁止在组件内硬编码颜色。

### 类型系统

- **后端**：`types/index.ts` — `DbRow extends RowDataPacket`（SQL 行类型）、`ApiResponse`、`PageQuery/PagResult`、`JwtPayload` + Express `Request.user` 扩展。
- **前端**：`types/` 按领域拆分，DTO 通过 `Omit`/`Partial` 从 Entity 派生。`router.ts` 扩写 `RouteMeta` 字段。

## 关键约定

- **分号**：不写（Prettier `semi: false`）；**引号**：单引号
- **数据库**：snake_case 列名 ↔ camelCase TS 属性（`toCamelCase` 桥接）
- **后端 TS**：`strict: true` + `noUnusedLocals` + `noUnusedParameters`
- **`any` 禁止**：后端 SQL 查询用 `DbRow[]`/`ResultSetHeader`，前端通过 `unknown` 桥接绕过 Axios 类型限制
- **死代码禁止**：已删除 `ConfirmDialog.vue`、`store/modules/employee.ts`、`store/modules/department.ts`
