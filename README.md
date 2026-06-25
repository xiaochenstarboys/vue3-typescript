# 酒店管理系统 Hotel Management System

基于 **Vue 3 + TypeScript + Element Plus + ECharts** 前端，**Node.js + Express + TypeScript + MySQL** 后端的全栈酒店运营管理平台。支持房型与客房管理、房态看板、预订与入住全流程、入住率与营收数据看板。

## ✨ 功能模块

- **数据看板**：今日入住率、在住客房、今日入住、今日营收；近 6 个月入账/已完成营收趋势；各房型客房占比。
- **房型与客房管理**：房型维护（房价/床型/面积/人数）；客房按房型网格化展示；房态（空闲/入住/脏房/维修）实时切换。
- **订单与入住管理**：预订登记、办理入住、办理退房、取消；同房日期冲突校验；选房型联动可选房间 + 自动算价。

## 🏗 技术架构

| 层 | 技术栈 |
|---|---|
| 前端 | Vue 3 + TypeScript + Vite + Element Plus + ECharts + Vuex + Less |
| 后端 | Node.js + Express + TypeScript + MySQL + Zod + JWT + bcrypt |

## 🚀 快速开始

### 1. 初始化数据库

```bash
mysql -u root -p < backend/sql/init.sql
```

> 脚本会创建 `hotel_system` 库并写入房型/客房/订单种子数据（日期相对 `CURDATE()` 动态生成，任意时间运行都有当日数据）。

### 2. 启动后端

```bash
cd backend
npm install
npm run dev          # http://localhost:3000
```

配置见 `backend/.env`（默认 `DB_NAME=hotel_system`，密码按本地修改）。

### 3. 启动前端

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

### 4. 登录

| 账号 | 密码 | 角色 |
|---|---|---|
| admin | password | 管理员 |
| manager | password | 经理 |

## 🔑 业务亮点

- **订单日期冲突校验**：同一客房在入住区间内不允许重叠预订，后端 SQL 区间相交校验。
- **入住/退房联动房态**：办理入住房间自动置「入住」；退房自动置「脏房」待保洁；取消已入住订单释放房间为「脏房」。
- **双主题设计系统**：暗色 Indigo + 浅色 Warm Stone，看板图表随主题重绘。

## 📁 目录结构

```
├─ backend/
│  ├─ src/
│  │  ├─ routes/        # auth / roomTypes / rooms / orders / dashboard
│  │  ├─ config/        # db 连接池
│  │  ├─ middleware/    # auth / asyncHandler / errorHandler
│  │  └─ utils/         # toCamelCase
│  └─ sql/init.sql      # 建表 + 种子数据
└─ frontend/
   └─ src/
      ├─ views/         # dashboard / room / order / login
      ├─ components/    # StatusBadge / UserAvatar / PageContainer
      ├─ composables/   # useRoom / useOrder / useTheme / useCountUp
      ├─ api/           # room / order / dashboard / auth
      ├─ types/         # room / order / api / router
      └─ styles/        # variables / theme / global
```
