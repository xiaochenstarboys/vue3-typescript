<template>
  <div class="department-page">
    <!-- 顶部标题栏 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">部门管理</h2>
        <span class="page-sub">{{ flat.length }} 个部门</span>
      </div>
      <el-button type="primary" :icon="Plus" @click="openForm()">新增部门</el-button>
    </div>

    <div class="dept-grid">
      <!-- 左侧树 -->
      <div class="dept-panel">
        <div class="panel-body">
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
                <el-icon class="node-icon"><FolderOpened v-if="data.children?.length" /><Folder v-else /></el-icon>
                <span class="node-label">{{ node.label }}</span>
                <span class="node-badge">{{ data.employeeCount ?? 0 }}</span>
                <div class="node-actions">
                  <el-button text size="small" @click.stop="openForm(data)"><el-icon :size="14"><Edit /></el-icon></el-button>
                  <el-popconfirm title="确认删除该部门？" @confirm="handleDelete(data.id)">
                    <template #reference>
                      <el-button text size="small" type="danger" @click.stop><el-icon :size="14"><Delete /></el-icon></el-button>
                    </template>
                  </el-popconfirm>
                </div>
              </div>
            </template>
          </el-tree>
        </div>
      </div>

      <!-- 右侧详情 -->
      <div class="dept-panel">
        <template v-if="selectedDept">
          <div class="detail-header">
            <div class="detail-info">
              <span class="detail-name">{{ selectedDept.name }}</span>
              <span class="detail-count">{{ selectedDept.employeeCount ?? empList.length }} 名员工</span>
            </div>
          </div>
          <div class="panel-body">
            <el-table v-loading="empLoading" :data="empList">
              <el-table-column label="员工" min-width="160">
                <template #default="{ row }">
                  <div class="emp-row">
                    <UserAvatar :name="row.name" :avatar="row.avatar" :size="32" />
                    <div class="emp-row-info">
                      <span class="emp-row-name">{{ row.name }}</span>
                      <span class="emp-row-meta">{{ row.position }}</span>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="状态" width="90">
                <template #default="{ row }"><StatusBadge :status="row.status" /></template>
              </el-table-column>
              <el-table-column label="手机号" min-width="120">
                <template #default="{ row }"><span class="text-sub">{{ row.phone }}</span></template>
              </el-table-column>
            </el-table>
          </div>
        </template>
        <div v-else class="empty-state">
          <el-icon :size="48" class="empty-icon"><OfficeBuilding /></el-icon>
          <p class="empty-title">选择一个部门</p>
          <p class="empty-desc">点击左侧部门查看该部门下的员工列表</p>
        </div>
      </div>
    </div>

    <DeptForm v-model:visible="formVisible" :department="editingDept" :dept-flat="flat" @saved="handleSaved" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, Edit, Delete, FolderOpened, Folder, OfficeBuilding } from '@element-plus/icons-vue'
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
    const r = await employeeApi.getList({ page: 1, pageSize: 100, departmentId: dept.id })
    empList.value = r.list
  } finally {
    empLoading.value = false
  }
}
function openForm(d?: Department) {
  editingDept.value = d ?? null
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
  display: flex;
  flex-direction: column;
  gap: @space-md;
  height: 100%;
}

// 页面头部
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: baseline;
  gap: @space-sm;
}

.page-title {
  font-size: @font-size-xl;
  font-weight: @font-weight-bold;
  color: @text-primary;
  margin: 0;
}

.page-sub {
  font-size: @font-size-sm;
  color: @text-secondary;
}

// 双栏布局
.dept-grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: @space-md;
  flex: 1;
  min-height: 0;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

// 面板
.dept-panel {
  background: @bg-card;
  border: 1px solid @border-color;
  border-radius: @border-radius-xl;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: @space-sm;
}

// 树节点
.tree-node {
  display: flex;
  align-items: center;
  gap: @space-sm;
  width: 100%;
  padding: 2px 0;

  .node-icon {
    color: @text-placeholder;
    font-size: 14px;
    flex-shrink: 0;
  }

  .node-label {
    flex: 1;
    font-size: @font-size-base;
    font-weight: @font-weight-medium;
    color: @text-primary;
  }

  .node-badge {
    font-size: @font-size-xs;
    color: @primary;
    background: rgba(var(--primary-rgb), 0.08);
    min-width: 24px;
    height: 20px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 7px;
    border-radius: 10px;
    font-weight: @font-weight-semibold;
    line-height: 1;
  }

  .node-actions {
    display: none;
    gap: 0;
  }

  &:hover .node-actions {
    display: flex;
  }
}

:deep(.el-tree-node__content) {
  height: 40px;
  border-radius: @border-radius-sm;
  padding-right: @space-xs;

  &:hover {
    background: var(--el-fill-color-light);
  }
}

:deep(.el-tree-node.is-current > .el-tree-node__content) {
  background: rgba(var(--primary-rgb), 0.06);
}

// 详情头部
.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: @space-md @space-xl;
  border-bottom: 1px solid @border-color;
  flex-shrink: 0;
}

.detail-info {
  display: flex;
  align-items: baseline;
  gap: @space-sm;
}

.detail-name {
  font-size: @font-size-md;
  font-weight: @font-weight-semibold;
  color: @text-primary;
}

.detail-count {
  font-size: @font-size-sm;
  color: @text-secondary;
}

// 员工行
.emp-row {
  display: flex;
  align-items: center;
  gap: @space-sm;
}

.emp-row-info {
  display: flex;
  flex-direction: column;
  gap: 1px;

  .emp-row-name {
    font-size: @font-size-base;
    font-weight: @font-weight-medium;
    color: @text-primary;
  }

  .emp-row-meta {
    font-size: @font-size-xs;
    color: @text-secondary;
  }
}

.text-sub {
  font-size: @font-size-sm;
  color: @text-regular;
}

// 表格微调
:deep(.el-table__header th) {
  font-weight: @font-weight-semibold;
  font-size: @font-size-xs;
  color: @text-secondary;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

// 空状态
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: @space-sm;
  color: @text-placeholder;

  .empty-icon {
    opacity: 0.3;
  }

  .empty-title {
    font-size: @font-size-md;
    font-weight: @font-weight-medium;
    color: @text-secondary;
    margin: 0;
  }

  .empty-desc {
    font-size: @font-size-sm;
    color: @text-placeholder;
    margin: 0;
  }
}
</style>
