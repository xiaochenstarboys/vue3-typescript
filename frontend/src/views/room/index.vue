<template>
  <div class="room-page">
    <!-- 顶部标题栏 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">房型与客房管理</h2>
        <span class="page-sub">{{ roomTypes.length }} 个房型 · {{ totalRooms }} 间客房</span>
      </div>
      <el-button type="primary" :icon="Plus" @click="openTypeForm()">新增房型</el-button>
    </div>

    <div class="room-grid">
      <!-- 左侧房型列表 -->
      <div class="room-panel">
        <div class="panel-body" v-loading="loading">
          <div
            v-for="t in roomTypes"
            :key="t.id"
            class="type-card"
            :class="{ active: selectedTypeId === t.id }"
            @click="selectType(t.id)"
          >
            <div class="type-head">
              <span class="type-name">{{ t.name }}</span>
              <span class="type-price">¥{{ t.basePrice }}<small>/晚</small></span>
            </div>
            <div class="type-meta">
              <span>{{ t.bedType }}</span>
              <span v-if="t.area">· {{ t.area }}㎡</span>
              <span>· 可住 {{ t.maxGuests }}人</span>
            </div>
            <div class="type-foot">
              <span class="room-stat">
                {{ t.availableCount ?? 0 }} 空闲 / {{ t.roomCount ?? 0 }} 间
              </span>
              <el-popconfirm title="确认删除该房型？有客房时无法删除" @confirm="handleDeleteType(t.id)">
                <template #reference>
                  <el-button text size="small" type="danger" :icon="Delete" class="type-del" @click.stop />
                </template>
              </el-popconfirm>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧客房网格 -->
      <div class="room-panel">
        <template v-if="selectedType">
          <div class="detail-header">
            <div class="detail-info">
              <span class="detail-name">{{ selectedType.name }}</span>
              <span class="detail-count">{{ filteredRooms.length }} 间客房</span>
            </div>
            <div class="detail-actions">
              <el-button size="small" :icon="Edit" @click="openTypeForm(selectedType)">编辑房型</el-button>
              <el-button size="small" type="primary" :icon="Plus" @click="openRoomDialog = true">新增客房</el-button>
            </div>
          </div>
          <!-- 搜索栏 -->
          <div class="room-search-bar">
            <el-input
              v-model="roomQuery.keyword"
              placeholder="搜索房号…"
              :prefix-icon="Search"
              clearable
              size="small"
              class="room-search-input"
              @input="handleRoomSearch"
            />
            <el-select
              v-model="roomQuery.status"
              placeholder="全部房态"
              clearable
              size="small"
              class="room-filter-select"
              @change="handleRoomSearch"
            >
              <el-option v-for="o in ROOM_STATUS_OPTIONS" :key="o.value" :label="o.label" :value="o.value" />
            </el-select>
            <el-select
              v-model="roomQuery.floor"
              placeholder="全部楼层"
              clearable
              size="small"
              class="room-filter-select"
              @change="handleRoomSearch"
            >
              <el-option v-for="f in floorOptions" :key="f" :label="`${f} 楼`" :value="f" />
            </el-select>
          </div>
          <div class="panel-body" v-loading="roomLoading">
            <div class="room-grid-list">
              <div
                v-for="r in filteredRooms"
                :key="r.id"
                class="room-tile"
                :class="r.status"
              >
                <div class="tile-head">
                  <span class="tile-no">{{ r.roomNumber }}</span>
                  <StatusBadge :status="r.status" variant="room" />
                </div>
                <span class="tile-floor">{{ r.floor }}楼 · ¥{{ r.basePrice || selectedType.basePrice }}</span>
                <div class="tile-actions">
                  <el-select
                    v-model="r.status"
                    size="small"
                    class="tile-status-select"
                    @change="(v: RoomStatus) => handleStatusChange(r.id, v)"
                  >
                    <el-option v-for="o in ROOM_STATUS_OPTIONS" :key="o.value" :label="o.label" :value="o.value" />
                  </el-select>
                  <el-button text size="small" type="danger" :icon="Delete" @click="handleDeleteRoom(r.id)" />
                </div>
              </div>
              <div v-if="!filteredRooms.length" class="empty-rooms">暂无匹配客房</div>
            </div>
          </div>
        </template>
        <div v-else class="empty-state">
          <el-icon :size="48" class="empty-icon"><OfficeBuilding /></el-icon>
          <p class="empty-title">选择一个房型</p>
          <p class="empty-desc">点击左侧房型查看该房型下的客房与房态</p>
        </div>
      </div>
    </div>

    <!-- 房型 / 客房表单 -->
    <RoomTypeForm v-model:visible="typeFormVisible" :room-type="editingType" @saved="handleSaved" />

    <el-dialog v-model="openRoomDialog" title="新增客房" width="420px" destroy-on-close>
      <el-form :model="roomForm" label-width="80px">
        <el-form-item label="房号" required>
          <el-input v-model="roomForm.roomNumber" placeholder="如 807" />
        </el-form-item>
        <el-form-item label="楼层" required>
          <el-input-number v-model="roomForm.floor" :min="1" :max="99" controls-position="right" style="width: 100%" />
        </el-form-item>
        <el-form-item label="房型">
          <el-input :value="selectedType?.name" disabled />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="openRoomDialog = false">取消</el-button>
        <el-button type="primary" :loading="roomSubmitting" @click="handleCreateRoom">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Search, Plus, Edit, Delete, OfficeBuilding } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import type { RoomType, RoomStatus, CreateRoomDTO } from '@/types/room'
import { useRoom } from '@/composables/useRoom'
import { ROOM_STATUS_OPTIONS } from '@/constants'
import StatusBadge from '@/components/StatusBadge.vue'
import RoomTypeForm from './components/RoomTypeForm.vue'

const {
  roomTypes, rooms, loading, roomQuery,
  fetchRoomTypes, fetchRooms,
  createRoom, removeRoom, updateRoomStatus, removeRoomType,
} = useRoom()

const selectedTypeId = ref<number | null>(null)
const roomLoading = ref(false)
const typeFormVisible = ref(false)
const editingType = ref<RoomType | null>(null)
const openRoomDialog = ref(false)
const roomSubmitting = ref(false)
const roomForm = ref<CreateRoomDTO>({ roomNumber: '', floor: 8, typeId: 0, status: 'available' })

const selectedType = computed(() => roomTypes.value.find((t) => t.id === selectedTypeId.value) ?? null)
const totalRooms = computed(() => roomTypes.value.reduce((sum, t) => sum + (t.roomCount ?? 0), 0))

/** 客户端搜索过滤客房 */
const filteredRooms = computed(() => {
  let result = rooms.value
  const { keyword, status, floor } = roomQuery
  if (keyword) {
    const kw = keyword.toLowerCase()
    result = result.filter((r) => r.roomNumber.toLowerCase().includes(kw))
  }
  if (status) {
    result = result.filter((r) => r.status === status)
  }
  if (floor !== undefined && floor !== null) {
    result = result.filter((r) => r.floor === Number(floor))
  }
  return result
})

/** 从当前房型客房中提取楼层列表 */
const floorOptions = computed(() => {
  const floors = [...new Set(rooms.value.map((r) => r.floor))].sort((a, b) => a - b)
  return floors
})

/** 搜索条件变化时重新过滤（客户端即时响应） */
function handleRoomSearch() {
  // 客户端 computed 已自动更新，无需额外操作
}

async function selectType(id: number) {
  selectedTypeId.value = id
  // 同步到 roomQuery，确保后续 fetchRooms() 携带房型筛选
  roomQuery.typeId = id
  roomQuery.keyword = ''
  roomQuery.status = ''
  roomQuery.floor = undefined
  roomLoading.value = true
  try {
    await fetchRooms(id)
  } finally {
    roomLoading.value = false
  }
}

function openTypeForm(t?: RoomType) {
  editingType.value = t ?? null
  typeFormVisible.value = true
}

async function handleDeleteType(id: number) {
  await removeRoomType(id)
  if (selectedTypeId.value === id) {
    selectedTypeId.value = null
    rooms.value = []
  }
}

async function handleSaved() {
  await fetchRoomTypes()
}

async function handleStatusChange(id: number, status: RoomStatus) {
  try {
    await updateRoomStatus(id, status)
    ElMessage.success('房态已更新')
  } catch {
    // 失败时刷新当前房型列表
    await fetchRooms(selectedTypeId.value ?? undefined)
  }
}

async function handleDeleteRoom(id: number) {
  await ElMessageBox.confirm('确认删除该客房？', '提示', { type: 'warning' })
  await removeRoom(id)
}

async function handleCreateRoom() {
  if (!selectedType.value) return
  if (!roomForm.value.roomNumber) {
    ElMessage.warning('请输入房号')
    return
  }
  roomSubmitting.value = true
  try {
    await createRoom({ ...roomForm.value, typeId: selectedType.value.id })
    openRoomDialog.value = false
    roomForm.value = { roomNumber: '', floor: 8, typeId: 0, status: 'available' }
    await fetchRoomTypes()
    await fetchRooms(selectedType.value.id)
  } finally {
    roomSubmitting.value = false
  }
}

onMounted(() => {
  fetchRoomTypes()
})
</script>

<style lang="less" scoped>
.room-page {
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
.room-grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: @space-md;
  flex: 1;
  min-height: 0;
  @media (max-width: 768px) { grid-template-columns: 1fr; }
}

.room-panel {
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

// 房型卡片
.type-card {
  padding: @space-md;
  border-radius: @border-radius;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s ease;
  margin-bottom: @space-xs;

  &:hover { background: var(--el-fill-color-light); }
  &.active {
    background: rgba(var(--primary-rgb), 0.08);
    border-color: rgba(var(--primary-rgb), 0.3);
  }

  .type-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 4px;
  }
  .type-name {
    font-size: @font-size-md;
    font-weight: @font-weight-semibold;
    color: @text-primary;
  }
  .type-price {
    font-size: @font-size-base;
    font-weight: @font-weight-bold;
    color: @primary;
    small { font-size: @font-size-xs; color: @text-secondary; font-weight: normal; }
  }
  .type-meta {
    font-size: @font-size-xs;
    color: @text-secondary;
    margin-bottom: @space-sm;
  }
  .type-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .room-stat {
    font-size: @font-size-xs;
    color: @text-secondary;
  }
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
.detail-actions {
  display: flex;
  gap: @space-xs;
}

// 客房搜索栏
.room-search-bar {
  display: flex;
  align-items: center;
  gap: @space-sm;
  padding: @space-sm @space-xl;
  border-bottom: 1px solid @border-color;
  flex-shrink: 0;
}
.room-search-input {
  width: 180px;
}
.room-filter-select {
  width: 120px;
}

// 客房网格
.room-grid-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: @space-sm;
}

.room-tile {
  padding: @space-sm @space-md;
  border-radius: @border-radius;
  border: 1px solid @border-color;
  background: var(--bg-card);
  transition: all 0.15s ease;

  &:hover { box-shadow: @shadow; }

  // 房态边框色
  &.available    { border-left: 3px solid @success; }
  &.occupied     { border-left: 3px solid @primary; }
  &.dirty        { border-left: 3px solid @warning; }
  &.maintenance  { border-left: 3px solid @danger; }

  .tile-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 4px;
  }
  .tile-no {
    font-size: @font-size-md;
    font-weight: @font-weight-bold;
    color: @text-primary;
  }
  .tile-floor {
    font-size: @font-size-xs;
    color: @text-secondary;
  }
  .tile-actions {
    display: flex;
    align-items: center;
    gap: @space-xs;
    margin-top: @space-sm;
  }
  .tile-status-select {
    flex: 1;
    :deep(.el-input__wrapper) { padding: 0 8px; }
  }
}

.empty-rooms {
  grid-column: 1 / -1;
  text-align: center;
  color: @text-placeholder;
  padding: @space-2xl;
  font-size: @font-size-sm;
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
  .empty-icon { opacity: 0.3; }
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
