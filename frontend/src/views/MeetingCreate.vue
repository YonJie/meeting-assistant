<template>
  <div class="meeting-create">
    <div class="page-header">
      <el-button icon="el-icon-arrow-left" @click="handleBack">返回</el-button>
      <h1 class="page-title">新建会议</h1>
    </div>

    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      label-width="100px"
      class="meeting-form"
    >
      <el-form-item label="标题" prop="title">
        <el-input v-model="form.title" placeholder="请输入会议标题" />
      </el-form-item>

      <el-form-item label="会议时间" prop="meetingTime">
        <el-date-picker
          v-model="form.meetingTime"
          type="datetime"
          placeholder="选择会议时间"
          value-format="yyyy-MM-dd HH:mm:ss"
          default-time="09:00:00"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="参会人员" prop="participants">
        <el-input
          v-model="form.participants"
          placeholder="多个参会人用逗号分隔"
        />
      </el-form-item>

      <el-form-item label="会议内容" prop="content">
        <el-input
          v-model="form.content"
          type="textarea"
          :rows="8"
          placeholder="请输入会议内容"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          提交并生成总结
        </el-button>
        <el-button @click="handleBack">返回</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { createMeeting, summarizeMeeting } from '@/api'

/**
 * 新建会议页
 * 路由 path: /create
 */
export default {
  name: 'MeetingCreate',
  data() {
    return {
      form: {
        title: '',
        meetingTime: new Date(),
        participants: '',
        content: ''
      },
      rules: {
        title: [
          { required: true, message: '请输入会议标题', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '请输入会议内容', trigger: 'blur' }
        ]
      },
      submitting: false
    }
  },
  methods: {
    /**
     * 返回列表页
     */
    handleBack() {
      this.$router.push('/')
    },

    /**
     * 提交表单并生成 AI 总结
     */
    handleSubmit() {
      this.$refs.form.validate(valid => {
        if (!valid) return

        this.submitting = true
        createMeeting(this.form).then(data => {
          const id = data.id
          const loading = this.$loading({
            lock: true,
            text: 'AI 总结生成中，请稍候...',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
          })

          return summarizeMeeting(id).then(() => {
            loading.close()
            this.$message.success('会议创建并总结成功')
            this.$router.push(`/meeting/${id}`)
          }).catch(err => {
            loading.close()
            throw err
          })
        }).finally(() => {
          this.submitting = false
        })
      })
    }
  }
}
</script>

<style scoped>
.meeting-create {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}

.page-title {
  margin: 0 0 0 16px;
  font-size: 22px;
  color: #303133;
}

.meeting-form {
  background: #fff;
  padding: 30px;
  border-radius: 4px;
}
</style>
