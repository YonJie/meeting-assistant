import axios from 'axios'
import { Loading, Message } from 'element-ui'

/**
 * Axios 实例
 * baseURL 为 /api，配合 vue.config.js 中的 devServer.proxy 转发到后端服务
 */
const service = axios.create({
  baseURL: '/api',
  timeout: 10000
})

let loadingCount = 0
let loadingInstance = null

/**
 * 开启全局 loading
 */
function startLoading() {
  if (loadingCount === 0) {
    loadingInstance = Loading.service({
      lock: true,
      text: '加载中...',
      spinner: 'el-icon-loading',
      background: 'rgba(0, 0, 0, 0.7)'
    })
  }
  loadingCount++
}

/**
 * 关闭全局 loading（通过计数器保证多个请求并发时 loading 不会提前关闭）
 */
function stopLoading() {
  if (loadingCount <= 0) return
  loadingCount--
  if (loadingCount === 0 && loadingInstance) {
    loadingInstance.close()
    loadingInstance = null
  }
}

/**
 * 请求拦截器
 * 默认开启 loading，可通过请求配置 showLoading: false 关闭
 */
service.interceptors.request.use(
  config => {
    if (config.showLoading !== false) {
      startLoading()
    }
    return config
  },
  error => {
    stopLoading()
    return Promise.reject(error)
  }
)

/**
 * 响应拦截器
 * 统一解构 response.data，当 code 不为 0 时抛出错误并由 Element UI 提示
 */
service.interceptors.response.use(
  response => {
    if (response.config.showLoading !== false) {
      stopLoading()
    }
    const res = response.data
    if (res.code !== 0) {
      Message.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return res.data
  },
  error => {
    if (error.config && error.config.showLoading !== false) {
      stopLoading()
    }
    const message = error.response?.data?.message || error.message || '网络异常'
    Message.error(message)
    return Promise.reject(error)
  }
)

/**
 * 创建会议
 * @param {Object} data - 会议数据
 * @param {Object} [config={}] - axios 额外配置
 * @returns {Promise<Object>}
 */
export function createMeeting(data, config = {}) {
  return service.post('/meetings', data, config)
}

/**
 * 获取会议分页列表
 * @param {Object} params - 查询参数
 * @param {number} [params.page] - 页码
 * @param {number} [params.limit] - 每页条数
 * @param {string} [params.search] - 标题模糊搜索关键词
 * @param {Object} [config={}] - axios 额外配置
 * @returns {Promise<Object>}
 */
export function getMeetings(params, config = {}) {
  return service.get('/meetings', { ...config, params })
}

/**
 * 获取单个会议详情
 * @param {number|string} id - 会议 ID
 * @param {Object} [config={}] - axios 额外配置
 * @returns {Promise<Object>}
 */
export function getMeeting(id, config = {}) {
  return service.get(`/meetings/${id}`, config)
}

/**
 * 更新会议
 * @param {number|string} id - 会议 ID
 * @param {Object} data - 更新的会议数据
 * @param {Object} [config={}] - axios 额外配置
 * @returns {Promise<Object>}
 */
export function updateMeeting(id, data, config = {}) {
  return service.put(`/meetings/${id}`, data, config)
}

/**
 * 删除会议
 * @param {number|string} id - 会议 ID
 * @param {Object} [config={}] - axios 额外配置
 * @returns {Promise<Object>}
 */
export function deleteMeeting(id, config = {}) {
  return service.delete(`/meetings/${id}`, config)
}

/**
 * AI 总结会议
 * @param {number|string} id - 会议 ID
 * @param {Object} [config={}] - axios 额外配置
 * @returns {Promise<Object>}
 */
export function summarizeMeeting(id, config = {}) {
  return service.post(`/meetings/${id}/summarize`, null, config)
}

/**
 * 更新会议待办状态
 * @param {number|string} id - 会议 ID
 * @param {number} index - 待办索引
 * @param {boolean} completed - 完成状态
 * @param {Object} [config={}] - axios 额外配置
 * @returns {Promise<Object>}
 */
export function updateTodoStatus(id, index, completed, config = {}) {
  return service.put(`/meetings/${id}/todos/${index}`, { completed }, config)
}

export default service
