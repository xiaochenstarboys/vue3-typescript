<template>
  <div class="employee-page">
    <!-- Search bar -->
    <el-card class="search-card">
      <el-form :model="query" inline>
        <el-form-item label="关键词">
          <el-input
            v-model="query.keyword"
            placeholder="姓名 / 邮箱 / 手机"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="部门">
          <el-select v-model="query.departmentId" placeholder="全部部门" clearable style="width: 150px">
            <el-option
              v-for="d in deptFlat"
              :key="d.id"
              :label="d.name"
              :value="d.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部状态" clearable style="width: 120px">
            <el-option label="在职" value="active" />
            <el-option label="试用期" value="probation" />
            <el-option label="离职" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Table card -->
    <el-card class="table-card">
      <template #header>
        <div class="table-header">
          <span class="title">员工列表</span>
          <div class="actions">
            <el-button
              v-if="selectedIds.length"
              type="danger"
              plain
              :icon="Delete"
              @click="handleBatchDelete"
            >
              批量删除 ({{ selectedIds.length }})
            </el-button>
            <el-button type="primary" :icon="Plus" @click="openForm()">新增员工</el-button>
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="list"
        stripe
        @selection-change="selectedIds = $event.map((r: Employee) => r.id)"
      >
        <el-table-column type="selection" width="48" />
        <el-table-column label="员工" min-width="160">
          <template #default="{ row }">
            <div class="employee-cell">
              <UserAvatar :name="row.name" :avatar="row.avatar" :size="36" />
              <div>
                <p class="name">{{ row.name }}</p>
                <p class="email">{{ row.email }}</p>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="departmentName" label="部门" min-width="100" />
        <el-table-column prop="position" label="职位" min-width="120" />
        <el-table-column label="薪资" min-width="110">
          <template #default="{ row }">
            <span class="salary">¥{{ row.salary.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="entryDate" label="入职日期" min-width="110" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <StatusBadge :status="row.status" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" size="small" @click="openForm(row)">编辑</el-button>
            <el-popconfirm
              title="确认删除该员工？"
              @confirm="removeEmployee(row.id)"
            >
              <template #reference>
                <el-button text type="danger" size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="query.page"
          v-model:page-size="query.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          background
          @change="fetchList"
        />
      </div>
    </el-card>

    <!-- Employee form drawer -->
    <EmployeeForm
      v-model:visible="formVisible"
      :employee="editingEmployee"
      :dept-flat="deptFlat"
      @saved="fetchList"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Search, Refresh, Plus, Delete } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import type { Employee } from '@/types/employee'
import { useEmployee } from '@/composables/useEmployee'
import { useDepartment } from '@/composables/useDepartment'
import UserAvatar from '@/components/UserAvatar.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import EmployeeForm from './components/EmployeeForm.vue'

const { list, total, loading, query, fetchList, removeEmployee, batchRemove, resetQuery } = useEmployee()
const { flat: deptFlat, fetchFlat } = useDepartment()

const selectedIds = ref<number[]>([])
const formVisible = ref(false)
const editingEmployee = ref<Employee | null>(null)

function handleSearch() {
  query.page = 1
  fetchList()
}

function openForm(employee?: Employee) {
  editingEmployee.value = employee ?? null
  formVisible.value = true
}

async function handleBatchDelete() {
  await ElMessageBox.confirm(`确认删除选中的 ${selectedIds.value.length} 名员工？`, '警告', { type: 'warning' })
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

.search-card :deep(.el-form-item) {
  margin-bottom: 0;
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .title {
    font-size: @font-size-md;
    font-weight: 600;
    color: @text-primary;
  }
}

.employee-cell {
  display: flex;
  align-items: center;
  gap: @space-sm;

  .name {
    font-weight: 500;
    color: @text-primary;
    font-size: @font-size-sm;
  }

  .email {
    font-size: @font-size-xs;
    color: @text-secondary;
    margin-top: 2px;
  }
}

.salary {
  font-weight: 500;
  color: @primary;
}

.pagination {
  display: flex;
  justify-content: center;
  padding-top: @space-lg;
}
</style>
