'use strict';

/**
 * 将 Vue 构建产物 frontend/dist 复制到根目录 public/
 * 供 Vercel CDN 托管静态资源（Express 原生部署场景）。
 *
 * 用法：
 *   node scripts/copy-frontend-to-public.js
 *
 * @module scripts/copy-frontend-to-public
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'frontend', 'dist');
const DEST = path.join(ROOT, 'public');

/**
 * 递归复制目录
 * @param {string} src
 * @param {string} dest
 * @returns {void}
 */
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(from, to);
    } else {
      fs.copyFileSync(from, to);
    }
  }
}

if (!fs.existsSync(SRC)) {
  console.error(`前端构建产物不存在: ${SRC}`);
  console.error('请先运行 frontend 的 npm run build');
  process.exit(1);
}

fs.rmSync(DEST, { recursive: true, force: true });
copyDir(SRC, DEST);
console.log(`已复制 frontend/dist → public/`);
