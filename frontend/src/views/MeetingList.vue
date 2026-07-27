<template>
  <div class="meeting-list">
    <div class="page-header">
      <h1 class="page-title">智能会议纪要助手</h1>
      <el-button type="primary" icon="el-icon-plus" @click="handleCreate">
        新建会议
      </el-button>
    </div>

    <div class="search-bar">
      <el-input
        v-model="searchKey"
        placeholder="请输入标题搜索"
        clearable
        @keyup.enter.native="fetchData"
      >
        <el-button
          slot="append"
          icon="el-icon-search"
          @click="fetchData"
        />
      </el-input>
    </div>

    <el-table
      v-loading="loading"
      :data="meetings"
      border
      stripe
      style="width: 100%"
    >
      <el-table-column prop="title" label="标题" min-width="200" />
      <el-table-column prop="meetingTime" label="会议时间" width="180" />
      <el-table-column prop="participants" label="参会人" min-width="200" />
      <el-table-column label="操作" width="150" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="handleView(scope.row)">
            查看
          </el-button>
          <el-button
            type="text"
            size="small"
            class="delete-btn"
            @click="handleDelete(scope.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      class="pagination"
      :current-page="page"
      :page-sizes="[10, 20, 50]"
      :page-size="limit"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script>
import { getMeetings, deleteMeeting } from '@/api'

/**
 * 会议列表页
 * 路由 path: /
 */
export default {
  name: 'MeetingList',
  data() {
    return {
      searchKey: '',
      meetings: [],
      page: 1,
      limit: 10,
      total: 0,
      loading: false
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    /**
     * 加载会议列表数据
     */
    fetchData() {
      this.loading = true
      getMeetings({
        page: this.page,
        limit: this.limit,
        search: this.searchKey
      }).then(data => {
        this.meetings = data.rows
        this.total = data.count
      }).finally(() => {
        this.loading = false
      })
    },

    /**
     * 每页条数变化
     * @param {number} val
     */
    handleSizeChange(val) {
      this.limit = val
      this.page = 1
      this.fetchData()
    },

    /**
     * 页码变化
     * @param {number} val
     */
    handleCurrentChange(val) {
      this.page = val
      this.fetchData()
    },

    /**
     * 跳转到新建会议页
     */
    handleCreate() {
      this.$router.push('/create')
    },

    /**
     * 查看会议详情
     * @param {Object} row
     */
    handleView(row) {
      this.$router.push(`/meeting/${row.id}`)
    },

    /**
     * 删除会议（带确认弹窗）
     * @param {Object} row
     */
    handleDelete(row) {
      this.$confirm('确认删除该会议？删除后不可恢复', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return deleteMeeting(row.id)
      }).then(() => {
        this.$message.success('删除成功')
        this.fetchData()
      })
    }
  }
}
</script>

<style scoped>
.meeting-list {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.search-bar {
  width: 320px;
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.delete-btn {
  color: #f56c6c;
}
</style>
