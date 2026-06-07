# 公司管理项目

> Vue 3 + TypeScript + Vite + Element Plus + Node.js Express + MySQL

## 技术栈

**前端**
- Vue 3 + TypeScript (strict mode)
- Vite 5
- Element Plus + @element-plus/icons-vue
- Vuex 4 (全模块类型化)
- Vue Router 4
- Axios (泛型封装)
- Less + CSS Variables 主题
- ECharts 数据可视化

**后端**
- Node.js + Express + TypeScript
- MySQL 8 + mysql2
- JWT 认证
- Zod 请求校验
- bcryptjs 密码加密

---

## 快速开始

### 1. 数据库初始化

```bash
mysql -u root -p < backend/sql/init.sql
```

### 2. 启动后端

```bash
cd backend
cp .env.example .env     # 填写数据库配置
npm install
npm run dev              # http://localhost:3000
```

### 3. 启动前端

```bash
cd frontend
npm install
npm run dev              # http://localhost:5173
```

### 4. 登录

| 账号 | 密码 | 角色 |
|------|------|------|
| admin | password | 管理员 |
| manager | password | 经理 |

---

## 项目结构

```
├── frontend/
│   └── src/
│       ├── api/          # 接口层（全类型化）
│       ├── composables/  # useEmployee / useDepartment / useTheme
│       ├── layouts/      # DefaultLayout + Sidebar + Navbar
│       ├── router/       # 路由守卫 + typed meta
│       ├── store/        # Vuex 模块（auth / employee / department）
│       ├── styles/       # Less 变量 + 全局样式
│       ├── types/        # 全局 TS 接口定义
│       └── views/        # login / dashboard / employee / department
└── backend/
    └── src/
        ├── config/       # MySQL 连接池
        ├── middleware/   # JWT 验证 + 错误处理
        ├── routes/       # auth / employees / departments
        └── types/        # 共享类型
```

---

## 核心功能

- **员工管理**：列表分页/筛选、新增、编辑（侧滑抽屉）、删除、批量删除
- **部门管理**：树形结构展示、左树右表联动、增删改
- **Dashboard**：数据统计卡片 + ECharts 折线图 + 饼图
- **认证**：JWT 登录、路由守卫、自动跳转
- **UI**：亮/暗主题切换、响应式布局、骨架屏、过渡动画

---

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/login | 登录 |
| GET | /api/employees | 分页查询员工 |
| POST | /api/employees | 新增员工 |
| PUT | /api/employees/:id | 编辑员工 |
| DELETE | /api/employees/:id | 删除员工 |
| DELETE | /api/employees | 批量删除 |
| GET | /api/departments | 获取部门树 |
| POST | /api/departments | 新增部门 |
| PUT | /api/departments/:id | 编辑部门 |
| DELETE | /api/departments/:id | 删除部门 |
