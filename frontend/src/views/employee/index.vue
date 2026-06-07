<template>
  <div class="employee-page">
    <!-- 顶部统计条 -->
    <div class="stats-bar">
      <div class="stat-item">
        <span class="stat-num">{{ total }}</span>
        <span class="stat-label">员工总数</span>
      </div>
      <div class="stat-divider" />
      <div class="stat-item active">
        <span class="stat-dot" />
        <span class="stat-num">{{ activeCount }}</span>
        <span class="stat-label">在职</span>
      </div>
      <div class="stat-divider" />
      <div class="stat-item probation">
        <span class="stat-dot" />
        <span class="stat-num">{{ probationCount }}</span>
        <span class="stat-label">试用期</span>
      </div>
      <div class="stat-divider" />
      <div class="stat-item inactive">
        <span class="stat-dot" />
        <span class="stat-num">{{ inactiveCount }}</span>
        <span class="stat-label">离职</span>
      </div>
    </div>

    <!-- 搜索 & 操作 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="query.keyword"
          placeholder="搜索姓名 / 邮箱 / 手机…"
          :prefix-icon="Search"
          clearable
          class="search-input"
          @keyup.enter="handleSearch"
        />
        <el-select v-model="query.departmentId" placeholder="全部部门" clearable class="filter-select">
          <el-option v-for="d in deptFlat" :key="d.id" :label="d.name" :value="d.id" />
        </el-select>
        <el-select v-model="query.status" placeholder="全部状态" clearable class="filter-select">
          <el-option label="在职" value="active" />
          <el-option label="试用期" value="probation" />
          <el-option label="离职" value="inactive" />
        </el-select>
      </div>
      <div class="toolbar-right">
        <el-button v-if="selectedIds.length" type="danger" plain :icon="Delete" @click="handleBatchDelete">
          删除 ({{ selectedIds.length }})
        </el-button>
        <el-button type="primary" :icon="Plus" @click="openForm()">新增员工</el-button>
      </div>
    </div>

    <!-- 表格 -->
    <div class="table-card">
      <el-table
        v-loading="loading"
        :data="list"
        @selection-change="selectedIds = $event.map((r: Employee) => r.id)"
        row-class-name="emp-row"
      >
        <el-table-column type="selection" width="44" />
        <el-table-column label="员工" min-width="200">
          <template #default="{ row }">
            <div class="emp-cell">
              <UserAvatar :name="row.name" :avatar="row.avatar" :size="40" />
              <div class="emp-info">
                <span class="emp-name">{{ row.name }}</span>
                <span class="emp-email">{{ row.email }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="部门" min-width="110">
          <template #default="{ row }">
            <span class="dept-tag">{{ row.departmentName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="职位" min-width="120">
          <template #default="{ row }">
            <span class="text-sub">{{ row.position }}</span>
          </template>
        </el-table-column>
        <el-table-column label="薪资" min-width="120" sortable="custom">
          <template #default="{ row }">
            <span class="salary">¥{{ row.salary.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column label="入职日期" min-width="120">
          <template #default="{ row }">
            <span class="text-sub">{{ row.entryDate?.slice(0, 10) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }"><StatusBadge :status="row.status" /></template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" size="small" @click="openForm(row)">编辑</el-button>
            <el-popconfirm title="确认删除该员工？" @confirm="removeEmployee(row.id)">
              <template #reference>
                <el-button text type="danger" size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <div class="table-footer">
        <span class="footer-total">共 {{ total }} 条记录</span>
        <el-pagination
          v-model:current-page="query.page"
          v-model:page-size="query.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="sizes, prev, pager, next"
          background
          @change="fetchList"
        />
      </div>
    </div>

    <EmployeeForm
      v-model:visible="formVisible"
      :employee="editingEmployee"
      :dept-flat="deptFlat"
      @saved="fetchList"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Search, Plus, Delete } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import type { Employee } from '@/types/employee'
import { useEmployee } from '@/composables/useEmployee'
import { useDepartment } from '@/composables/useDepartment'
import UserAvatar from '@/components/UserAvatar.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import EmployeeForm from './components/EmployeeForm.vue'

const { list, total, loading, query, fetchList, removeEmployee, batchRemove } = useEmployee()
const { flat: deptFlat, fetchFlat } = useDepartment()
const selectedIds = ref<number[]>([])
const formVisible = ref(false)
const editingEmployee = ref<Employee | null>(null)

const activeCount = computed(() => list.value.filter((e) => e.status === 'active').length)
const probationCount = computed(() => list.value.filter((e) => e.status === 'probation').length)
const inactiveCount = computed(() => list.value.filter((e) => e.status === 'inactive').length)

function handleSearch() {
  query.page = 1
  fetchList()
}
function openForm(e?: Employee) {
  editingEmployee.value = e ?? null
  formVisible.value = true
}
async function handleBatchDelete() {
  await ElMessageBox.confirm(`确认删除 ${selectedIds.value.length} 名员工？`, '警告', { type: 'warning' })
  await batchRemove(selectedIds.value)
  selectedIds.value = []
}
onMounted(() => {
  fetchList()
  fetchFlat()
})
</script>

<style lang="less" scoped>
.employee-page {
  display: flex;
  flex-direction: column;
  gap: @space-md;
}

// ==========================================
// 统计条
// ==========================================
.stats-bar {
  display: flex;
  align-items: center;
  gap: 0;
  background: @bg-card;
  border: 1px solid @border-color;
  border-radius: @border-radius-xl;
  padding: @space-md @space-xl;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: @space-sm;
  flex: 1;
  justify-content: center;

  .stat-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: @text-placeholder;
    flex-shrink: 0;
  }

  .stat-num {
    font-size: @font-size-xl;
    font-weight: @font-weight-extrabold;
    color: @text-primary;
    line-height: 1;
  }

  .stat-label {
    font-size: @font-size-sm;
    color: @text-secondary;
    font-weight: @font-weight-medium;
  }

  &.active .stat-dot {
    background: @success;
    box-shadow: 0 0 6px rgba(var(--success-rgb), 0.4);
  }

  &.probation .stat-dot {
    background: @warning;
    box-shadow: 0 0 6px rgba(var(--warning-rgb), 0.4);
  }

  &.inactive .stat-dot {
    background: @danger;
    box-shadow: 0 0 6px rgba(var(--danger-rgb), 0.3);
  }
}

.stat-divider {
  width: 1px;
  height: 28px;
  background: @border-color;
  flex-shrink: 0;
}

// ==========================================
// 工具栏
// ==========================================
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: @space-md;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: @space-sm;
  flex: 1;
}

.search-input {
  width: 240px;
}

.filter-select {
  width: 140px;
}

// ==========================================
// 表格卡片
// ==========================================
.table-card {
  background: @bg-card;
  border: 1px solid @border-color;
  border-radius: @border-radius-xl;
  overflow: hidden;

  // 表头
  :deep(.el-table__header th) {
    background: var(--table-header-bg) !important;
    font-weight: @font-weight-semibold;
    font-size: @font-size-xs;
    color: @text-secondary;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    padding: 14px 0;
    border-bottom: 2px solid var(--border-color) !important;
    user-select: none;
  }

  // 行
  :deep(.emp-row) {
    transition: background 0.12s ease;
  }

  :deep(.el-table__body tr:hover > td) {
    background: var(--table-hover-bg) !important;
  }

  // 单元格
  :deep(.el-table__body td) {
    padding: 12px 0;
  }

  // 复选框列
  :deep(.el-table-column--selection .cell) {
    padding: 0 10px;
  }

  // 去掉表格内边框
  :deep(.el-table__inner-wrapper::before) {
    display: none;
  }
}

// 表格底栏
.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: @space-sm @space-xl @space-md;
  border-top: 1px solid @border-color;
  background: var(--el-fill-color-light);
}

.footer-total {
  font-size: @font-size-sm;
  color: @text-secondary;
}

// ==========================================
// 单元格内容
// ==========================================
.emp-cell {
  display: flex;
  align-items: center;
  gap: @space-sm;
}

.emp-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;

  .emp-name {
    font-size: @font-size-base;
    font-weight: @font-weight-semibold;
    color: @text-primary;
    line-height: 1.3;
  }

  .emp-email {
    font-size: @font-size-xs;
    color: @text-secondary;
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.dept-tag {
  display: inline-block;
  font-size: @font-size-xs;
  font-weight: @font-weight-medium;
  padding: 3px 10px;
  border-radius: 6px;
  background: rgba(var(--primary-rgb), 0.07);
  color: @primary;
  white-space: nowrap;
}

.salary {
  font-weight: @font-weight-bold;
  color: @text-primary;
  font-size: @font-size-base;
}

.text-sub {
  font-size: @font-size-sm;
  color: @text-regular;
}

// ==========================================
// 亮色模式微调
// ==========================================
[data-theme="light"] {
  .stats-bar {
    background: #FCFBFA;
    border-color: #E8E4DC;
  }

  .table-card :deep(.el-table__header th) {
    color: @text-secondary;
  }
}

// ==========================================
// 响应式
// ==========================================
@media (max-width: 900px) {
  .toolbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .toolbar-left {
    flex-wrap: wrap;
  }

  .search-input {
    width: 100%;
  }

  .stat-label {
    display: none;
  }

  .stats-bar {
    padding: @space-sm @space-md;
  }
}
</style>
