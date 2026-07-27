'use strict';

const SENTENCE_SPLIT = /[。！？；\n]+/;

/**
 * 将文本按句子拆分
 * @param {string} text
 * @returns {string[]}
 */
function splitSentences(text) {
  return text
    .split(SENTENCE_SPLIT)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * 从句子中提取待办任务描述
 * @param {string} sentence
 * @returns {string}
 */
function extractTodoTask(sentence) {
  const markers = ['待办', '下一步'];
  for (const marker of markers) {
    const idx = sentence.indexOf(marker);
    if (idx !== -1) {
      const task = sentence.slice(idx + marker.length).replace(/^[：:、，,\s]+/, '').trim();
      return task || sentence;
    }
  }
  return sentence;
}

/**
 * 模拟 AI 总结：基于关键词规则解析
 * @param {string} content
 * @returns {{ summary: string, decisions: string[], todos: { task: string, completed: boolean }[] }}
 */
function mockGenerateSummary(content) {
  const text = content.trim();
  const sentences = splitSentences(text);
  const decisions = [];
  const todos = [];

  for (const sentence of sentences) {
    if (sentence.includes('决定') && !decisions.includes(sentence)) {
      decisions.push(sentence);
    }
    if ((sentence.includes('待办') || sentence.includes('下一步')) && !todos.some((t) => t.task === extractTodoTask(sentence))) {
      todos.push({ task: extractTodoTask(sentence), completed: false });
    }
  }

  const summary = text.length <= 100 ? text : `${text.slice(0, 100)}...`;

  return { summary, decisions, todos };
}

/**
 * 调用 OpenAI Chat API 生成总结
 * @param {string} content
 * @returns {Promise<{ summary: string, decisions: string[], todos: { task: string, completed: boolean }[] }>}
 */
async function openaiGenerateSummary(content) {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = (process.env.OPENAI_API_BASE || 'https://api.openai.com/v1').replace(/\/$/, '');

  const systemPrompt = [
    '你是会议纪要助手。请分析会议转写内容，输出严格 JSON 格式，字段如下：',
    '{"summary":"会议概述","decisions":["决策1"],"todos":[{"task":"待办描述","completed":false}]}',
    'decisions 为字符串数组，todos 中 completed 一律为 false。只返回 JSON，不要其他文字。',
  ].join('\n');

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      temperature: 0.3,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content },
      ],
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    const error = new Error(`OpenAI API 调用失败: ${response.status} ${errBody}`);
    error.status = 502;
    error.code = 50201;
    throw error;
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content;
  if (!rawContent) {
    const error = new Error('OpenAI 返回内容为空');
    error.status = 502;
    error.code = 50202;
    throw error;
  }

  const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
  const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : rawContent);

  return normalizeResult(parsed, content);
}

/**
 * 规范化 AI 返回结构
 * @param {object} parsed
 * @param {string} fallbackContent
 * @returns {{ summary: string, decisions: string[], todos: { task: string, completed: boolean }[] }}
 */
function normalizeResult(parsed, fallbackContent) {
  const summary =
    typeof parsed.summary === 'string' && parsed.summary.trim()
      ? parsed.summary.trim()
      : fallbackContent.slice(0, 100);

  const decisions = Array.isArray(parsed.decisions)
    ? parsed.decisions.filter((d) => typeof d === 'string' && d.trim()).map((d) => d.trim())
    : [];

  const todos = Array.isArray(parsed.todos)
    ? parsed.todos
        .filter((t) => t && typeof t.task === 'string' && t.task.trim())
        .map((t) => ({ task: t.task.trim(), completed: Boolean(t.completed) }))
    : [];

  return { summary, decisions, todos };
}

/**
 * AI 总结服务
 */
class AiService {
  /**
   * 根据会议转写内容生成摘要、决策与待办
   * @param {string} content - 会议转写全文
   * @returns {Promise<{ summary: string, decisions: string[], todos: { task: string, completed: boolean }[] }>}
   */
  async generateSummary(content) {
    if (!content || !String(content).trim()) {
      const error = new Error('会议内容为空，无法生成摘要');
      error.status = 400;
      error.code = 40001;
      throw error;
    }

    const text = String(content).trim();

    if (process.env.OPENAI_API_KEY) {
      return openaiGenerateSummary(text);
    }

    return mockGenerateSummary(text);
  }
}

module.exports = new AiService();
