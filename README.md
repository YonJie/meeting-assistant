# 智能会议纪要助手

基于 **Vue 2 + Element UI + Node.js + Express + Sequelize + MySQL** 构建的智能会议纪要管理应用。支持录入会议转写内容、AI 自动生成摘要/决策/待办、在线查看与编辑待办完成状态。

---

## 环境依赖

- [Node.js](https://nodejs.org/)（建议 v18 及以上）
- [MySQL](https://www.mysql.com/)（5.7 或 8.0 均可）
- [npm](https://www.npmjs.com/)（随 Node.js 附带）
- 可选：OpenAI API Key（用于真实 AI 总结，未配置时使用本地关键词模拟）

---

## 创建数据库

登录 MySQL 后执行：

```sql
CREATE DATABASE meeting_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- 验证
SHOW DATABASES LIKE 'meeting_db';
```

---

## 环境变量

在后端 `backend` 目录创建 `.env` 文件（可复制 `.env.example`）：

```bash
cd backend
copy .env.example .env
```

编辑 `.env`：

```env
# 服务端口
PORT=3000

# MySQL 数据库配置
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=meeting_db
DB_USER=root
DB_PASSWORD=your_password

# AI 服务（可选）
# 未配置时使用本地规则模拟；配置后调用 OpenAI Chat API
# OPENAI_API_KEY=sk-xxx
# OPENAI_API_BASE=https://api.openai.com/v1
```

> 注意：前端 `frontend` 目录在开发阶段通过 `vue.config.js` 代理访问 `/api`，无需额外配置环境变量。

---

## 安装步骤

### 1. 克隆/进入项目根目录

```bash
cd meeting-assistant
```

### 2. 启动后端

```bash
cd backend
npm install

# 初始化数据库表结构并插入测试数据
npm run seed

# 启动开发服务
npm run dev
```

后端服务运行后访问：

- 健康检查：`http://localhost:3000/health`
- 会议 API 前缀：`http://localhost:3000/api/meetings`

### 3. 启动前端

新开一个终端：

```bash
cd frontend
npm install
npm run serve
```

前端访问地址：`http://localhost:8080`

---

## 访问地址

| 服务 | 地址 | 说明 |
|------|------|------|
| 前端页面 | `http://localhost:8080` | Vue 2 + Element UI |
| 后端 API | `http://localhost:3000` | Express + Sequelize |
| 健康检查 | `http://localhost:3000/health` | 返回 `{ "status": "ok" }` |
| 会议接口 | `http://localhost:3000/api/meetings` | 所有会议相关接口前缀 |

---

## 项目结构

```
meeting-assistant/
├── AI_PROMPTS.md                 # 本次 AI 交互日志
├── README.md                     # 本文件
├── docs/
│   └── 设计文档.md               # 数据库/API 设计文档
├── backend/                      # 后端服务
│   ├── app.js                    # 入口文件
│   ├── package.json              # 后端依赖与脚本
│   ├── .env.example              # 环境变量示例
│   ├── .gitignore
│   ├── seed.js                   # 数据库初始化 + 测试数据
│   ├── scripts/
│   │   └── syncDb.js             # 独立同步数据库表结构
│   ├── config/
│   │   ├── db.js                 # Sequelize 连接配置
│   │   └── config.json           # Sequelize CLI 配置
│   ├── models/
│   │   ├── index.js              # 模型注册与同步方法
│   │   └── Meeting.js            # Meetings 表模型
│   ├── routes/
│   │   └── meetingRoutes.js      # /api/meetings 路由定义
│   ├── controllers/
│   │   └── meetingController.js  # 会议 CRUD 与 AI 总结控制器
│   ├── services/
│   │   └── aiService.js          # AI 总结服务（本地模拟 / OpenAI）
│   └── middleware/
│       └── errorHandler.js       # 全局异常与 404 处理
│
└── frontend/                     # 前端 Vue 2 项目（由 Vue CLI 创建）
    ├── package.json              # 前端依赖与脚本
    ├── vue.config.js             # Vue CLI 配置 /api 代理
    ├── public/
    │   └── index.html
    └── src/
        ├── main.js               # 入口，引入 Element UI / Router / Axios
        ├── App.vue               # 根组件，仅包含路由视图
        ├── router/               # Vue Router 配置
        ├── views/                # 页面组件
        ├── components/           # 业务组件
        ├── api/                  # Axios 接口封装
        └── assets/               # 静态资源
```

---

## 核心接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/meetings` | 创建会议 |
| GET | `/api/meetings?page=&limit=&search=` | 分页列表 + 标题搜索 |
| GET | `/api/meetings/:id` | 会议详情 |
| PUT | `/api/meetings/:id` | 更新会议 |
| DELETE | `/api/meetings/:id` | 删除会议 |
| POST | `/api/meetings/:id/summarize` | AI 生成摘要/决策/待办 |
| PUT | `/api/meetings/:id/todos/:index` | 更新指定待办完成状态 |

---

## 可用脚本

### 后端

```bash
cd backend
npm run dev      # 使用 nodemon 开发热重载
npm start        # 使用 node 启动（生产）
npm run sync     # 同步数据库表结构
npm run seed     # 初始化数据并插入测试会议
```

### 前端

```bash
cd frontend
npm run serve    # 启动开发服务器
npm run build    # 生产构建
```

---

## 开发流程建议

1. 确保 MySQL 已启动，并创建 `meeting_db`。
2. 配置后端 `.env` 文件。
3. 启动后端 `npm run dev`，访问 `http://localhost:3000/health` 验证。
4. 执行 `npm run seed` 插入测试数据。
5. 启动前端 `npm run serve`，访问 `http://localhost:8080` 开始开发。

---

## 常见问题

### 1. 数据库连接失败

检查 `.env` 中的 `DB_HOST`、`DB_PORT`、`DB_USER`、`DB_PASSWORD` 是否正确，并确认 MySQL 服务已启动。

### 2. 前端请求后端报跨域错误

开发环境已配置 `vue.config.js` 代理 `/api` 到 `http://localhost:3000`。确保 Axios baseURL 为 `/api` 而非完整地址，避免路径重复。

### 3. AI 总结为占位内容

未配置 `OPENAI_API_KEY` 时，后端使用本地关键词规则模拟。配置真实 Key 后自动切换为 OpenAI `gpt-3.5-turbo` 调用。

### 4. 表结构与 Model 不一致

运行 `npm run sync` 或 `npm run seed`，使用 `alter: true` 自动对齐表结构。生产环境建议改为 Sequelize Migration 管理。
