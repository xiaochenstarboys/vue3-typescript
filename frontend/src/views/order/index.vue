<template>
  <div class="order-page">
    <!-- 顶部统计条 -->
    <div class="stats-bar">
      <div class="stat-item">
        <span class="stat-num">{{ total }}</span>
        <span class="stat-label">订单总数</span>
      </div>
      <div class="stat-divider" />
      <div class="stat-item reserved">
        <span class="stat-dot" />
        <span class="stat-num">{{ reservedCount }}</span>
        <span class="stat-label">已预订</span>
      </div>
      <div class="stat-divider" />
      <div class="stat-item checked-in">
        <span class="stat-dot" />
        <span class="stat-num">{{ checkedInCount }}</span>
        <span class="stat-label">已入住</span>
      </div>
      <div class="stat-divider" />
      <div class="stat-item checked-out">
        <span class="stat-dot" />
        <span class="stat-num">{{ checkedOutCount }}</span>
        <span class="stat-label">已退房</span>
      </div>
    </div>

    <!-- 搜索 & 操作 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="query.keyword"
          placeholder="搜索住客 / 订单号 / 手机…"
          :prefix-icon="Search"
          clearable
          class="search-input"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />
        <el-select v-model="query.roomTypeId" placeholder="全部房型" clearable class="filter-select" @change="handleSearch">
          <el-option v-for="t in roomTypes" :key="t.id" :label="t.name" :value="t.id" />
        </el-select>
        <el-select v-model="query.status" placeholder="全部状态" clearable class="filter-select" @change="handleSearch">
          <el-option v-for="o in ORDER_STATUS_OPTIONS" :key="o.value" :label="o.label" :value="o.value" />
        </el-select>
      </div>
      <div class="toolbar-right">
        <el-button v-if="selectedIds.length" type="danger" plain :icon="Delete" @click="handleBatchDelete">
          删除 ({{ selectedIds.length }})
        </el-button>
        <el-button type="primary" :icon="Plus" @click="openForm()">新增订单</el-button>
      </div>
    </div>

    <!-- 表格 -->
    <div class="table-card">
      <el-table
        v-loading="loading"
        :data="list"
        @selection-change="selectedIds = $event.map((r: Order) => r.id)"
        row-class-name="order-row"
      >
        <el-table-column type="selection" width="44" />
        <el-table-column label="订单号" min-width="150">
          <template #default="{ row }">
            <span class="order-no">{{ row.orderNo }}</span>
          </template>
        </el-table-column>
        <el-table-column label="住客" min-width="160">
          <template #default="{ row }">
            <div class="guest-cell">
              <UserAvatar :name="row.guestName" :size="36" />
              <div class="guest-info">
                <span class="guest-name">{{ row.guestName }}</span>
                <span class="guest-phone">{{ row.guestPhone }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="房型 / 房号" min-width="130">
          <template #default="{ row }">
            <div class="room-cell">
              <span class="room-no">{{ row.roomNumber }}</span>
              <span class="room-type">{{ row.typeName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="入住 / 退房" min-width="180">
          <template #default="{ row }">
            <span class="date-range">
              {{ row.checkIn?.slice(0, 10) }}
              <el-icon class="date-arrow"><Right /></el-icon>
              {{ row.checkOut?.slice(0, 10) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="天数" width="70" align="center">
          <template #default="{ row }"><span class="nights">{{ row.nights }}晚</span></template>
        </el-table-column>
        <el-table-column label="金额" min-width="110" sortable>
          <template #default="{ row }">
            <span class="amount">¥{{ Number(row.totalAmount).toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="96">
          <template #default="{ row }"><StatusBadge :status="row.status" variant="order" /></template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status === 'reserved'" text type="success" size="small" @click="handleCheckIn(row)">入住</el-button>
            <el-button v-if="row.status === 'checked_in'" text type="warning" size="small" @click="handleCheckOut(row)">退房</el-button>
            <el-button v-if="row.status === 'reserved' || row.status === 'checked_in'" text type="danger" size="small" @click="handleCancel(row)">取消</el-button>
            <el-button text type="primary" size="small" @click="openForm(row)">编辑</el-button>
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

    <OrderForm
      v-model:visible="formVisible"
      :order="editingOrder"
      :room-types="roomTypes"
      @saved="fetchList"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Search, Plus, Delete, Right } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import type { Order } from '@/types/order'
import type { RoomType } from '@/types/room'
import { useOrder } from '@/composables/useOrder'
import { useRoom } from '@/composables/useRoom'
import { ORDER_STATUS_OPTIONS } from '@/constants'
import { roomTypeApi } from '@/api/room'
import UserAvatar from '@/components/UserAvatar.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import OrderForm from './components/OrderForm.vue'

const {
  list, total, loading, query, fetchList,
  checkIn, checkOut, cancelOrder, batchRemove,
} = useOrder()
const { fetchRoomTypes } = useRoom()

const roomTypes = ref<RoomType[]>([])
const selectedIds = ref<number[]>([])
const formVisible = ref(false)
const editingOrder = ref<Order | null>(null)

const reservedCount = computed(() => list.value.filter((o) => o.status === 'reserved').length)
const checkedInCount = computed(() => list.value.filter((o) => o.status === 'checked_in').length)
const checkedOutCount = computed(() => list.value.filter((o) => o.status === 'checked_out').length)

function handleSearch() {
  query.page = 1
  fetchList()
}
function openForm(o?: Order) {
  editingOrder.value = o ?? null
  formVisible.value = true
}
async function handleCheckIn(row: Order) {
  await ElMessageBox.confirm(`确认为「${row.guestName}」办理入住？房号 ${row.roomNumber}`, '办理入住', { type: 'success' })
  await checkIn(row.id)
}
async function handleCheckOut(row: Order) {
  await ElMessageBox.confirm(`确认为「${row.guestName}」办理退房？房号 ${row.roomNumber} 将转为待保洁`, '办理退房', { type: 'warning' })
  await checkOut(row.id)
}
async function handleCancel(row: Order) {
  await ElMessageBox.confirm(`确认取消订单「${row.orderNo}」？`, '取消订单', { type: 'warning' })
  await cancelOrder(row.id)
}
async function handleBatchDelete() {
  await ElMessageBox.confirm(`确认删除 ${selectedIds.value.length} 条订单？`, '警告', { type: 'warning' })
  await batchRemove(selectedIds.value)
  selectedIds.value = []
}

onMounted(async () => {
  roomTypes.value = await roomTypeApi.getList()
  fetchRoomTypes()
  fetchList()
})
</script>

<style lang="less" scoped>
.order-page {
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
  &.reserved .stat-dot   { background: @info;    box-shadow: 0 0 6px rgba(var(--info-rgb), 0.4); }
  &.checked-in .stat-dot { background: @primary; box-shadow: 0 0 6px rgba(var(--primary-rgb), 0.4); }
  &.checked-out .stat-dot{ background: @success; box-shadow: 0 0 6px rgba(var(--success-rgb), 0.4); }
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
.search-input { width: 240px; }
.filter-select { width: 140px; }

// ==========================================
// 表格卡片
// ==========================================
.table-card {
  background: @bg-card;
  border: 1px solid @border-color;
  border-radius: @border-radius-xl;
  overflow: hidden;

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
  :deep(.order-row) { transition: background 0.12s ease; }
  :deep(.el-table__body tr:hover > td) { background: var(--table-hover-bg) !important; }
  :deep(.el-table__body td) { padding: 12px 0; }
  :deep(.el-table-column--selection .cell) { padding: 0 10px; }
  :deep(.el-table__inner-wrapper::before) { display: none; }
}

.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: @space-sm @space-xl @space-md;
  border-top: 1px solid @border-color;
  background: var(--el-fill-color-light);
}
.footer-total { font-size: @font-size-sm; color: @text-secondary; }

// ==========================================
// 单元格内容
// ==========================================
.order-no {
  font-family: 'SF Mono', 'Consolas', monospace;
  font-size: @font-size-xs;
  color: @text-secondary;
  letter-spacing: 0.02em;
}

.guest-cell {
  display: flex;
  align-items: center;
  gap: @space-sm;
}
.guest-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  .guest-name {
    font-size: @font-size-base;
    font-weight: @font-weight-semibold;
    color: @text-primary;
    line-height: 1.3;
  }
  .guest-phone {
    font-size: @font-size-xs;
    color: @text-secondary;
    line-height: 1.3;
  }
}

.room-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
  .room-no {
    font-size: @font-size-base;
    font-weight: @font-weight-bold;
    color: @primary;
  }
  .room-type {
    font-size: @font-size-xs;
    color: @text-secondary;
  }
}

.date-range {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: @font-size-sm;
  color: @text-regular;
  .date-arrow { color: @text-placeholder; font-size: 12px; }
}

.nights {
  font-size: @font-size-sm;
  color: @text-secondary;
  font-weight: @font-weight-medium;
}

.amount {
  font-weight: @font-weight-bold;
  color: @text-primary;
  font-size: @font-size-base;
}

// ==========================================
// 亮色模式微调
// ==========================================
[data-theme="light"] {
  .stats-bar { background: #FCFBFA; border-color: #E8E4DC; }
}

// ==========================================
// 响应式
// ==========================================
@media (max-width: 900px) {
  .toolbar { flex-direction: column; align-items: flex-start; }
  .toolbar-left { flex-wrap: wrap; }
  .search-input { width: 100%; }
  .stat-label { display: none; }
  .stats-bar { padding: @space-sm @space-md; }
}
</style>
