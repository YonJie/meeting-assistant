'use strict';

const { Op } = require('sequelize');
const { Meeting } = require('../models');
const aiService = require('../services/aiService');

/**
 * 创建会议
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function create(req, res, next) {
  try {
    const { title, meetingTime, participants, content } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({ code: 40001, message: '会议标题不能为空', data: null });
    }

    const meeting = await Meeting.create({
      title: String(title).trim(),
      meetingTime: meetingTime || null,
      participants: participants || null,
      content: content || null,
    });

    res.status(201).json({ code: 0, message: '创建成功', data: meeting });
  } catch (err) {
    next(err);
  }
}

/**
 * 分页列表，支持标题模糊搜索
 * Query: ?page=1&limit=10&search=xxx
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function findAll(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const search = req.query.search ? String(req.query.search).trim() : '';

    const where = {};
    if (search) {
      where.title = { [Op.like]: `%${search}%` };
    }

    const { count, rows } = await Meeting.findAndCountAll({
      where,
      attributes: { exclude: ['content'] },
      order: [['meeting_time', 'DESC']],
      offset: (page - 1) * limit,
      limit,
    });

    res.json({
      code: 0,
      message: 'ok',
      data: {
        count,
        rows,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 按 id 查找会议详情
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function findOne(req, res, next) {
  try {
    const meeting = await Meeting.findByPk(req.params.id);
    if (!meeting) {
      return res.status(404).json({ code: 40401, message: '会议不存在', data: null });
    }
    res.json({ code: 0, message: 'ok', data: meeting });
  } catch (err) {
    next(err);
  }
}

/**
 * 按 id 更新会议
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function update(req, res, next) {
  try {
    const meeting = await Meeting.findByPk(req.params.id);
    if (!meeting) {
      return res.status(404).json({ code: 40401, message: '会议不存在', data: null });
    }

    const { title, meetingTime, participants, content } = req.body;
    const updates = {};

    if (title !== undefined) updates.title = String(title).trim();
    if (meetingTime !== undefined) updates.meetingTime = meetingTime;
    if (participants !== undefined) updates.participants = participants;
    if (content !== undefined) updates.content = content;

    await meeting.update(updates);
    res.json({ code: 0, message: '更新成功', data: meeting });
  } catch (err) {
    next(err);
  }
}

/**
 * 按 id 删除会议
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function deleteMeeting(req, res, next) {
  try {
    const meeting = await Meeting.findByPk(req.params.id);
    if (!meeting) {
      return res.status(404).json({ code: 40401, message: '会议不存在', data: null });
    }

    await meeting.destroy();
    res.json({ code: 0, message: '删除成功', data: { id: Number(req.params.id) } });
  } catch (err) {
    next(err);
  }
}

/**
 * AI 总结：生成并写回 summary / decisions / todos
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function summarize(req, res, next) {
  try {
    const meeting = await Meeting.findByPk(req.params.id);
    if (!meeting) {
      return res.status(404).json({ code: 40401, message: '会议不存在', data: null });
    }

    const { summary, decisions, todos } = await aiService.generateSummary(meeting.content);

    await meeting.update({ summary, decisions, todos });
    await meeting.reload();

    res.json({ code: 0, message: 'AI 总结完成', data: meeting });
  } catch (err) {
    next(err);
  }
}

/**
 * 更新指定待办的 completed 状态
 * PUT /api/meetings/:id/todos/:index  body: { completed: boolean }
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function updateTodo(req, res, next) {
  try {
    const meeting = await Meeting.findByPk(req.params.id);
    if (!meeting) {
      return res.status(404).json({ code: 40401, message: '会议不存在', data: null });
    }

    const index = parseInt(req.params.index, 10);
    const todos = [...(meeting.todos || [])];

    if (Number.isNaN(index) || index < 0 || index >= todos.length) {
      return res.status(400).json({ code: 40002, message: '待办索引无效', data: null });
    }

    const { completed } = req.body;
    if (typeof completed !== 'boolean') {
      return res.status(400).json({ code: 40003, message: 'completed 必须为 boolean 类型', data: null });
    }

    todos[index].completed = completed;
    await meeting.update({ todos });

    res.json({ code: 0, message: '待办状态更新成功', data: meeting });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  create,
  findAll,
  findOne,
  update,
  delete: deleteMeeting,
  summarize,
  updateTodo,
};
