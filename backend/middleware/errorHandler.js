'use strict';

/**
 * 404 处理中间件
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    code: 404,
    message: `接口不存在: ${req.method} ${req.originalUrl}`,
    data: null,
  });
}

/**
 * 全局异常处理中间件
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function errorHandler(err, req, res, next) {
  console.error('[Error]', err);

  res.status(500).json({
    code: 500,
    message: err.message,
    data: null,
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
