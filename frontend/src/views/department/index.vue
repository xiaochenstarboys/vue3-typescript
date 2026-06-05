<template>
  <div class="department-page">
    <el-row :gutter="20">
      <!-- Left: department tree -->
      <el-col :xs="24" :md="8">
        <el-card class="dept-tree-card">
          <template #header>
            <div class="card-header">
              <span class="title">部门结构</span>
              <el-button type="primary" size="small" :icon="Plus" @click="openForm()">新增</el-button>
            </div>
          </template>
          <el-tree
            v-loading="loading"
            :data="tree"
            :props="{ label: 'name', children: 'children' }"
            node-key="id"
            highlight-current
            default-expand-all
            @node-click="handleNodeClick"
          >
            <template #default="{ node, data }">
              <div class="tree-node">
                <span class="node-label">{{ node.label }}</span>
                <span class="node-count">{{ data.employeeCount ?? 0 }}人</span>
                <div class="node-actions">
                  <el-button text size="small" @click.stop="openForm(data)">
                    <el-icon><Edit /></el-icon>
                  </el-button>
                  <el-popconfirm
                    title="确认删除该部门？"
                    @confirm="handleDelete(data.id)"
                  >
                    <template #reference>
                      <el-button text size="small" type="danger" @click.stop>
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </template>
                  </el-popconfirm>
                </div>
              </div>
            </template>
          </el-tree>
        </el-card>
      </el-col>

      <!-- Right: employee list of selected dept -->
      <el-col :xs="24" :md="16">
        <el-card class="dept-employee-card">
          <template #header>
            <div class="card-header">
              <span class="title">
                {{ selectedDept ? selectedDept.name + ' · 员工列表' : '点击左侧部门查看员工' }}
              </span>
            </div>
          </template>
          <el-table
            v-loading="empLoading"
            :data="empList"
            stripe
            style="width: 100%"
          >
            <el-table-column label="员工" min-width="160">
              <template #default="{ row }">
                <div class="employee-cell">
                  <UserAvatar :name="row.name" :avatar="row.avatar" :size="32" />
                  <span>{{ row.name }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="position" label="职位" />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <StatusBadge :status="row.status" />
              </template>
            </el-table-column>
            <el-table-column prop="phone" label="手机号" min-width="120" />
          </el-table>
          <el-empty v-if="!selectedDept && !empLoading" description="请选择左侧部门" />
        </el-card>
      </el-col>
    </el-row>

    <DeptForm
      v-model:visible="formVisible"
      :department="editingDept"
      :dept-flat="flat"
      @saved="handleSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import type { Department } from '@/types/department'
import type { Employee } from '@/types/employee'
import { useDepartment } from '@/composables/useDepartment'
import { employeeApi } from '@/api/employee'
import UserAvatar from '@/components/UserAvatar.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import DeptForm from './components/DeptForm.vue'

const { tree, flat, loading, fetchTree, fetchFlat, removeDept } = useDepartment()

const selectedDept = ref<Department | null>(null)
const empList = ref<Employee[]>([])
const empLoading = ref(false)
const formVisible = ref(false)
const editingDept = ref<Department | null>(null)

async function handleNodeClick(dept: Department) {
  selectedDept.value = dept
  empLoading.value = true
  try {
    const result = await employeeApi.getList({ page: 1, pageSize: 100, departmentId: dept.id })
    empList.value = result.list
  } finally {
    empLoading.value = false
  }
}

function openForm(dept?: Department) {
  editingDept.value = dept ?? null
  formVisible.value = true
}

async function handleDelete(id: number) {
  await removeDept(id)
  if (selectedDept.value?.id === id) {
    selectedDept.value = null
    empList.value = []
  }
}

async function handleSaved() {
  await fetchTree()
  await fetchFlat()
}

onMounted(() => {
  fetchTree()
  fetchFlat()
})
</script>

<style lang="less" scoped>
.department-page {
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .title {
      font-size: @font-size-md;
      font-weight: 600;
      color: @text-primary;
    }
  }
}

.tree-node {
  display: flex;
  align-items: center;
  gap: @space-sm;
  width: 100%;

  .node-label { flex: 1; font-size: @font-size-sm; }
  .node-count { font-size: @font-size-xs; color: @text-secondary; }

  .node-actions {
    display: none;
    gap: 2px;
  }

  &:hover .node-actions { display: flex; }
}

.employee-cell {
  display: flex;
  align-items: center;
  gap: @space-sm;
}

.dept-tree-card,
.dept-employee-card {
  height: 100%;
  min-height: 500px;
}
</style>
