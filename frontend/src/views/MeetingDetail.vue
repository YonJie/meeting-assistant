<template>
  <div v-loading="loading" class="meeting-detail">
    <div class="page-header">
      <el-button icon="el-icon-arrow-left" @click="handleBack">返回列表</el-button>
      <h1 class="page-title">会议详情</h1>
    </div>

    <el-card class="detail-card">
      <div slot="header" class="card-header">
        <span>基本信息</span>
      </div>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="标题">
          {{ meeting.title || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="会议时间">
          {{ meeting.meetingTime || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="参会人">
          {{ meeting.participants || '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card class="detail-card">
      <div slot="header" class="card-header">
        <span>原始内容</span>
      </div>
      <pre class="content-text">{{ meeting.content || '暂无内容' }}</pre>
    </el-card>

    <el-card class="detail-card">
      <div slot="header" class="card-header">
        <span>AI 总结</span>
      </div>
      <div class="summary-text">{{ meeting.summary || '暂无总结' }}</div>
    </el-card>

    <el-card class="detail-card">
      <div slot="header" class="card-header">
        <span>决策事项</span>
      </div>
      <div v-if="meeting.decisions && meeting.decisions.length">
        <el-tag
          v-for="(item, index) in meeting.decisions"
          :key="index"
          class="decision-tag"
        >
          {{ item }}
        </el-tag>
      </div>
      <div v-else class="empty-text">暂无决策事项</div>
    </el-card>

    <el-card class="detail-card">
      <div slot="header" class="card-header">
        <span>待办事项</span>
      </div>
      <div v-if="meeting.todos && meeting.todos.length">
        <div
          v-for="(todo, index) in meeting.todos"
          :key="index"
          class="todo-item"
        >
          <el-checkbox
            :checked="todo.completed"
            @change="handleTodoChange(index, $event)"
          >
            {{ todo.task }}
          </el-checkbox>
        </div>
      </div>
      <div v-else class="empty-text">暂无待办</div>
    </el-card>

    <div class="footer-actions">
      <el-button type="primary" :loading="summarizing" @click="handleSummarize">
        重新总结
      </el-button>
      <el-button @click="handleBack">返回列表</el-button>
    </div>
  </div>
</template>

<script>
import { getMeeting, summarizeMeeting, updateTodoStatus } from '@/api'

/**
 * 会议详情页
 * 路由 path: /meeting/:id
 */
export default {
  name: 'MeetingDetail',
  data() {
    return {
      meeting: {
        title: '',
        meetingTime: '',
        participants: '',
        content: '',
        summary: '',
        decisions: [],
        todos: []
      },
      loading: false,
      summarizing: false
    }
  },
  computed: {
    /**
     * 路由参数中的会议 ID
     * @returns {string|number}
     */
    meetingId() {
      return this.$route.params.id
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    /**
     * 加载会议详情
     */
    fetchData() {
      this.loading = true
      getMeeting(this.meetingId).then(data => {
        this.meeting = data
      }).finally(() => {
        this.loading = false
      })
    },

    /**
     * 待办状态变更
     * @param {number} index - 待办索引
     * @param {boolean} completed - 新的完成状态
     */
    handleTodoChange(index, completed) {
      updateTodoStatus(this.meetingId, index, completed).then(() => {
        this.$message.success('待办状态更新成功')
        this.fetchData()
      }).catch(() => {
        this.fetchData()
      })
    },

    /**
     * 重新生成 AI 总结
     */
    handleSummarize() {
      this.summarizing = true
      summarizeMeeting(this.meetingId).then(() => {
        this.$message.success('重新总结完成')
        this.fetchData()
      }).finally(() => {
        this.summarizing = false
      })
    },

    /**
     * 返回列表页
     */
    handleBack() {
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
.meeting-detail {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  margin: 0 0 0 16px;
  font-size: 22px;
  color: #303133;
}

.detail-card {
  margin-bottom: 20px;
}

.card-header {
  font-weight: bold;
}

.content-text {
  white-space: pre-wrap;
  word-wrap: break-word;
  line-height: 1.6;
  margin: 0;
  font-family: inherit;
}

.summary-text {
  line-height: 1.6;
}

.decision-tag {
  margin-right: 10px;
  margin-bottom: 10px;
}

.todo-item {
  margin-bottom: 10px;
}

.empty-text {
  color: #909399;
  font-size: 14px;
}

.footer-actions {
  margin-top: 30px;
  text-align: center;
}
</style>
