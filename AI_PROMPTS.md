# AI 交互日志

> 记录本次开发“智能会议纪要助手”项目期间的关键 AI 交互节点，便于回溯、复盘与交接。
> 技术栈：Node.js + Express + Sequelize + MySQL + Vue 2 + Element UI。

---

## 阶段 1：数据库与 API 方案设计

- **我的提问**：
  请作为全栈架构师，帮我设计“智能会议纪要助手”的数据库表结构和 API 方案。技术栈为 Node.js + Express + Sequelize + MySQL + Vue2。要求设计 `Meetings` 表（含 title、meeting_time、participants、content、summary、decisions、todos、时间戳），给出 Sequelize Model 定义代码，以及前缀 `/api/meetings` 的 RESTful API 列表（创建、分页列表 + 搜索、详情、更新、删除、AI 总结、更新待办状态）。

- **AI 回复摘要**：
  给出了 MySQL 建表 SQL（`meetings` 表），包含 `JSON` 字段的 Sequelize Model 定义（`todos` 与 `decisions` 均为 `DataTypes.JSON`），并完整设计了 7 个 RESTful 接口，统一响应格式为 `{ code, message, data }`。

- **人工调整**：
  将 `participants` 从 `TEXT` 调整为 `STRING(1000)`，符合“逗号分隔人名”的存储需求；`decisions` 最终采用 JSON 数组，避免纯文本展示弱的问题。

---

## 阶段 2：后端项目骨架初始化

- **我的提问**：
  在 `backend` 文件夹中生成一个 Express + Sequelize 项目骨架。要求 `npm init -y`、安装 express / sequelize / mysql2 / dotenv / cors / nodemon，创建 app.js、config/db.js、models/index.js + Meeting.js、routes/meetingRoutes.js、controllers/meetingController.js、services/aiService.js、middleware/errorHandler.js，配置 CORS 与 express.json()，提供 config.json 或 .env 示例，以及 GET /health 测试接口。

- **AI 回复摘要**：
  完成 `backend` 目录初始化，安装全部依赖，创建完整目录结构，并写入所有样板文件。`app.js` 启动时自动测试数据库连接，挂载健康检查接口与会议路由，全局异常处理中间件已就位。

- **人工调整**：
  在 `package.json` 中将默认入口改为 `app.js`，增加 `start` 与 `dev` scripts，后续又增加了 `sync` 和 `seed` 脚本。

---

## 阶段 3：数据库连接与 Model 同步

- **我的提问**：
  在 `config/db.js` 中使用 Sequelize 连接 MySQL 并导出实例；在 `models/Meeting.js` 实现 Meetings 表模型（`todos` 为 `DataTypes.JSON`，启用 `timestamps: true`，不需要软删除）；在 `models/index.js` 统一导出 Meeting；并给出同步数据库代码（`force: false`，`alter: true` 方便调试）。

- **AI 回复摘要**：
  完成了 `config/db.js` 的 Sequelize 配置与实例导出，`Meeting.js` 的字段定义（含 JSON getter 与默认值），`models/index.js` 的 `syncDatabase()` 方法（`{ force: false, alter: true }`），并补充了 `scripts/syncDb.js` 独立同步脚本。

- **人工调整**：
  无显著调整；`db.js` 中默认使用环境变量，若未配置则回退到 root / 空密码 / 本地 MySQL。

---

## 阶段 4：Controller 与 AI 总结服务实现

- **我的提问**：
  在 `controllers/meetingController.js` 中实现 `create`、`findAll`（支持 `?page=1&limit=10&search=xxx`，`Op.like` 模糊查询，返回分页数据 `count, rows`）、`findOne`、`update`、`delete`。在 `services/aiService.js` 中实现 `generateSummary(content)`：解析关键词“决定”“待办”“下一步”，生成 `summary` / `decisions` / `todos`；若配置 `OPENAI_API_KEY` 则调用真实 OpenAI `gpt-3.5-turbo` API。

- **AI 回复摘要**：
  重写 Controller 五个核心方法；`aiService.js` 支持两种模式：本地规则解析与 OpenAI JSON 模式。本地模式按句分词，命中关键词即提取；OpenAI 模式通过 `fetch` 调用 Chat Completions，支持 `OPENAI_API_BASE` 自定义地址。

- **人工调整**：
  将 `findAll` 的搜索参数统一命名为 `search`，分页参数为 `page` / `limit`；后续将 `updateTodo` 的路径参数从 `todoIndex` 改回 `index` 以匹配需求文档。

---

## 阶段 5：AI 总结与待办状态接口

- **我的提问**：
  在 `meetingController.js` 中添加 `summarize` 方法：根据 `req.params.id` 查找会议，调用 `aiService.generateSummary`，更新 `summary` / `decisions` / `todos`，返回更新后的数据。添加 `updateTodo` 方法：接收 `id` 与 `todoIndex`，从 `req.body` 获取 `completed`，修改 `todos` JSON 数组指定索引后保存并返回成功消息。

- **AI 回复摘要**：
  在 Controller 中实现 `summarize`（调用 AI 后 `update()` 并 `reload()`）和 `updateTodo`（路径 `:index`，校验 `completed` 为 boolean，数组深拷贝后修改）。

- **人工调整**：
  将路径参数统一为 `index`（与最初 API 设计一致），并返回完整会议记录，方便前端刷新详情。

---

## 阶段 6：路由挂载与全局异常处理

- **我的提问**：
  在 `routes/meetingRoutes.js` 中定义 7 条路由（`POST /`、`GET /`、`GET /:id`、`PUT /:id`、`DELETE /:id`、`POST /:id/summarize`、`PUT /:id/todos/:index`），在 `app.js` 中挂载 `/api/meetings`，实现全局异常处理中间件，返回统一格式 `{ code: 500, message: err.message, data: null }`。

- **AI 回复摘要**：
  路由文件已按指定接口绑定 Controller；`app.js` 挂载完成；`errorHandler` 捕获所有 `next(err)` 并返回统一格式，404 处理也按统一格式返回 `{ code: 404, ... }`。

- **人工调整**：
  无调整；异常处理覆盖同步与异步错误，Express 5 的默认错误处理已被自定义中间件替代。

---

## 阶段 7：种子数据与数据库初始化

- **我的提问**：
  在 `package.json` 添加 `start` / `dev` scripts；生成 `backend/seed.js` 脚本用于初始化数据库并插入 2-3 条测试会议数据（包含虚拟会议内容）；并告知如何创建 MySQL 数据库。

- **AI 回复摘要**：
  `package.json` 已具备 `start`、`dev`、`sync`、`seed` 四个脚本；`seed.js` 实现“连接 → 同步 → 判重 → 插入 3 条测试数据”；并给出 `CREATE DATABASE meeting_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;` 命令及 `.env` 配置步骤。

- **人工调整**：
  测试数据均包含“决定”“待办”“下一步”关键词，便于直接测试模拟 AI 总结功能；第三条记录预置了 summary 和 todos，方便验证待办勾选接口。

---

## 阶段 8：Vue 2 前端项目搭建

- **我的提问**：
  在 `frontend` 目录下使用 Vue CLI 创建 Vue 2 项目，安装 Vue Router 和 Axios，安装 Element UI 并在 `main.js` 中引入（完整引入或按需引入），在 `vue.config.js` 中配置 `devServer.proxy` 将 `/api` 代理到 `http://localhost:3000`，清理 `App.vue` 默认内容保留路由视图。

- **AI 回复摘要**：
  给出 `@vue/cli` 全局安装命令，创建 Vue 2 项目（选择 Vue 2 + Router + Vuex 等），安装 `element-ui` 和 `axios`；`main.js` 完整引入 Element UI；`vue.config.js` 配置代理；`App.vue` 清理为仅包含 `<router-view/>` 和基础布局。

- **人工调整**：
  若 Vue CLI 安装缓慢或失败，可改用 `vue create frontend` 并选择手动特性；`element-ui` 按需引入方案（`babel-plugin-component`）作为可选配置备用。

---

## 阶段 9：前端会议列表页面

- **我的提问**：
  在 Vue 2 前端中实现会议列表页面。要求：通过 Axios 请求 `GET /api/meetings?page=1&limit=10&search=xxx`，使用 Element UI 的 `el-table` 展示 title / meeting_time / participants / summary，支持分页、搜索框，点击“查看详情”跳转到详情页。

- **AI 回复摘要**：
  创建 `views/MeetingList.vue`，包含搜索框、分页组件、表格与操作列；Axios 封装于 `api/request.js` 统一处理 `{ code, message, data }` 响应；Vue Router 配置 `/meetings` 与 `/meetings/:id` 两条路由。

- **人工调整**：
  将日期格式化抽取为工具函数；分页切换与搜索回车事件统一处理，避免重复请求。

---

## 阶段 10：前端会议详情与 AI 总结

- **我的提问**：
  在 Vue 2 前端中实现会议详情页。要求：进入页面请求 `GET /api/meetings/:id`，展示 content / summary / decisions / todos；点击“生成 AI 总结”调用 `POST /api/meetings/:id/summarize`；待办项可勾选，调用 `PUT /api/meetings/:id/todos/:index`。

- **AI 回复摘要**：
  创建 `views/MeetingDetail.vue`，左侧展示会议基本信息与转写原文，右侧展示 AI 摘要、决策列表、待办列表；待办使用 `el-checkbox` 绑定 completed 状态，点击时触发 API 更新；顶部提供返回按钮与“重新总结”按钮。

- **人工调整**：
  在 AI 总结前增加确认弹窗，避免误触发；待办更新后给出 `this.$message.success` 提示；decisions 为空时展示空状态提示。

---

## 阶段 11：前后端联调与部署准备

- **我的提问**：
  前后端联调：后端 `npm run dev` 运行在本机 3000 端口，前端 `npm run serve` 运行在本机 8080 端口，通过 `vue.config.js` 代理解决跨域。请检查常见联调问题并提供部署建议。

- **AI 回复摘要**：
  确认代理配置 `pathRewrite: { '^/api': '' }` 与后端 `/api/meetings` 路径匹配；排查 Axios baseURL 是否重复拼接 `/api`；建议后端生产环境配置 CORS 白名单、前端生产构建后部署到 Nginx 并反向代理 `/api` 到后端服务。

- **人工调整**：
  开发环境使用 `devServer.proxy`，生产环境改为 `axios` baseURL 读取环境变量 `VUE_APP_API_BASE_URL`；`backend/.env` 增加 `CORS_ORIGIN` 配置便于生产跨域控制。

---

## 阶段 12：记录本次交互（本文档）

- **我的提问**：
  请帮我生成 `AI_PROMPTS.md` 文件，记录本次开发的所有关键提问，格式为：阶段标题、我的提问、AI 回复摘要、人工调整。需列举至少 8-10 个交互节点，涵盖设计、后端 CRUD、AI 服务、前端列表、前端详情、联调部署。

- **AI 回复摘要**：
  生成本 `AI_PROMPTS.md` 文件，按 12 个阶段梳理了从数据库设计到部署准备的完整交互过程。

- **人工调整**：
  后续可根据实际开发进展持续补充阶段 13、14 …（如单元测试、认证鉴权、OpenAI 真实接入、CI/CD 等）。

---

## 附录：常用命令速查

```bash
# 后端
cd backend
npm install
npm run dev        # 开发热重载
npm run seed       # 初始化数据库并插入测试数据
npm run sync       # 仅同步表结构

# 前端
cd frontend
npm install
npm run serve      # 开发服务器
npm run build      # 生产构建
```

## 附录：核心接口速查

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/meetings` | 创建会议 |
| GET | `/api/meetings?page=&limit=&search=` | 分页列表 + 搜索 |
| GET | `/api/meetings/:id` | 详情 |
| PUT | `/api/meetings/:id` | 更新 |
| DELETE | `/api/meetings/:id` | 删除 |
| POST | `/api/meetings/:id/summarize` | AI 总结 |
| PUT | `/api/meetings/:id/todos/:index` | 更新待办状态 |
