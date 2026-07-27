'use strict';

/**
 * 初始化数据库并插入测试会议数据
 * 用法: npm run seed
 */
require('dotenv').config();

const { testConnection } = require('./config/db');
const { Meeting, syncDatabase } = require('./models');

const seedMeetings = [
  {
    title: '产品需求评审会',
    meetingTime: new Date('2026-07-20T14:00:00'),
    participants: '张三,李四,王五',
    content: [
      '张三：大家好，今天评审 Q3 产品路线图。',
      '李四：首页改版方案已经完成原型，建议优先上线。',
      '王五：技术侧评估需要两周开发周期。',
      '我们决定采用 Vue2 + Element UI 作为前端技术栈。',
      '我们决定 Q3 第一个迭代聚焦首页改版。',
      '待办：李四在本周五前输出 PRD 终稿。',
      '待办：王五完成技术方案评审文档。',
      '下一步：下周一召开技术评审会。',
    ].join('\n'),
    summary: null,
    decisions: [],
    todos: [],
  },
  {
    title: '项目周例会',
    meetingTime: new Date('2026-07-22T10:00:00'),
    participants: '张三,赵六',
    content: [
      '张三：汇报上周进度，用户模块开发完成 80%。',
      '赵六：测试环境已部署，发现 3 个阻塞缺陷。',
      '我们决定本周优先修复 P0 缺陷后再发版。',
      '待办：赵六整理缺陷清单并同步给开发。',
      '下一步：周三进行回归测试。',
    ].join('\n'),
    summary: null,
    decisions: [],
    todos: [],
  },
  {
    title: '年度预算讨论会',
    meetingTime: new Date('2026-07-25T15:30:00'),
    participants: '李四,王五,陈七',
    content: [
      '李四：介绍各部门预算申请情况。',
      '王五：研发部门申请增加 15% 预算用于 AI 能力建设。',
      '陈七：市场部希望追加投放预算。',
      '我们决定研发 AI 项目预算上调 10%。',
      '我们决定市场部 Q3 投放维持现有水平。',
      '待办：陈七提交详细投放计划。',
      '待办：王五输出 AI 项目立项书。',
      '下一步：月底提交最终预算方案给管理层审批。',
    ].join('\n'),
    summary: '讨论各部门预算申请，重点审议研发 AI 与市场投放计划。',
    decisions: ['我们决定研发 AI 项目预算上调 10%。', '我们决定市场部 Q3 投放维持现有水平。'],
    todos: [
      { task: '陈七提交详细投放计划', completed: false },
      { task: '王五输出 AI 项目立项书', completed: false },
    ],
  },
];

async function seed() {
  try {
    await testConnection();
    console.log('数据库连接成功');

    await syncDatabase();

    const existingCount = await Meeting.count();
    if (existingCount > 0) {
      console.log(`已有 ${existingCount} 条会议记录，跳过插入测试数据`);
      process.exit(0);
    }

    const records = await Meeting.bulkCreate(seedMeetings);
    console.log(`成功插入 ${records.length} 条测试会议数据`);

    records.forEach((m) => {
      console.log(`  - [${m.id}] ${m.title}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('Seed 失败:', err.message);
    process.exit(1);
  }
}

seed();
