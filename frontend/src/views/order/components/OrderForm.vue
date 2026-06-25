<template>
  <el-drawer
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
    :title="isEdit ? '编辑订单' : '新增订单'"
    size="520px"
    destroy-on-close
    class="order-drawer"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="88px" label-position="right">
      <!-- 住客信息 -->
      <fieldset class="form-section">
        <legend class="section-title">
          <el-icon :size="14"><User /></el-icon> 住客信息
        </legend>
        <el-form-item label="姓名" prop="guestName">
          <el-input v-model="form.guestName" placeholder="请输入住客姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="guestPhone">
          <el-input v-model="form.guestPhone" placeholder="1xxxxxxxxxx" />
        </el-form-item>
        <el-form-item label="身份证号">
          <el-input v-model="form.guestIdCard" placeholder="选填" />
        </el-form-item>
      </fieldset>

      <!-- 入住信息 -->
      <fieldset class="form-section">
        <legend class="section-title">
          <el-icon :size="14"><House /></el-icon> 入住信息
        </legend>
        <el-form-item label="房型" prop="roomTypeId">
          <el-select
            v-model="form.roomTypeId"
            placeholder="选择房型"
            style="width: 100%"
            @change="onRoomTypeChange"
          >
            <el-option v-for="t in roomTypes" :key="t.id" :label="`${t.name} · ¥${t.basePrice}/晚`" :value="t.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="房号" prop="roomId">
          <el-select
            v-model="form.roomId"
            placeholder="先选房型"
            style="width: 100%"
            :disabled="!form.roomTypeId"
          >
            <el-option
              v-for="r in availableRooms"
              :key="r.id"
              :label="`${r.roomNumber}（${r.floor}楼${r.status === 'available' ? '·空闲' : '·占用中'}）`"
              :value="r.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="入住日期" prop="checkIn">
          <el-date-picker
            v-model="form.checkIn"
            type="date"
            placeholder="选择入住日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
            :disabled-date="disabledPast"
          />
        </el-form-item>
        <el-form-item label="退房日期" prop="checkOut">
          <el-date-picker
            v-model="form.checkOut"
            type="date"
            placeholder="选择退房日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
            :disabled-date="disabledBeforeCheckIn"
          />
        </el-form-item>
        <div class="price-preview" v-if="preview.nights > 0">
          <span class="preview-label">
            {{ preview.nights }} 晚 × ¥{{ preview.basePrice }}
          </span>
          <span class="preview-amount">合计 ¥{{ preview.total.toLocaleString() }}</span>
        </div>
      </fieldset>

      <!-- 押金与备注 -->
      <fieldset class="form-section">
        <legend class="section-title">
          <el-icon :size="14"><Wallet /></el-icon> 押金与备注
        </legend>
        <el-form-item label="押金">
          <el-input-number
            v-model="form.deposit"
            :min="0"
            :step="100"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="选填" />
        </el-form-item>
      </fieldset>
    </el-form>

    <template #footer>
      <el-button @click="$emit('update:visible', false)">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        {{ isEdit ? '保存修改' : '确认预订' }}
      </el-button>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { User, House, Wallet } from '@element-plus/icons-vue'
import type { Order, CreateOrderDTO } from '@/types/order'
import type { RoomType, Room } from '@/types/room'
import { orderApi } from '@/api/order'
import { roomApi } from '@/api/room'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  visible: boolean
  order: Order | null
  roomTypes: RoomType[]
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  saved: []
}>()

const formRef = ref<FormInstance>()
const submitting = ref(false)
const isEdit = computed(() => !!props.order)

const availableRooms = ref<Room[]>([])

interface OrderFormState extends CreateOrderDTO {
  roomTypeId?: number
}

const defaultForm = (): OrderFormState => ({
  guestName: '',
  guestPhone: '',
  guestIdCard: '',
  roomId: 0,
  roomTypeId: undefined,
  checkIn: '',
  checkOut: '',
  deposit: 500,
  remark: '',
})

const form = reactive<OrderFormState>(defaultForm())

// 实时算价预览
const preview = computed(() => {
  const type = props.roomTypes.find((t) => t.id === form.roomTypeId)
  const basePrice = type?.basePrice ?? 0
  if (!form.checkIn || !form.checkOut || !basePrice) return { nights: 0, basePrice, total: 0 }
  const nights = Math.round((new Date(form.checkOut).getTime() - new Date(form.checkIn).getTime()) / 86400000)
  return { nights: Math.max(0, nights), basePrice, total: Math.max(0, nights) * basePrice }
})

async function onRoomTypeChange() {
  form.roomId = 0
  if (!form.roomTypeId) {
    availableRooms.value = []
    return
  }
  // 该房型的客房：空闲可预订；编辑时保留当前已选房号
  const all = await roomApi.getList({ typeId: form.roomTypeId })
  availableRooms.value = all.filter((r) => r.status === 'available' || (isEdit.value && r.id === form.roomId))
}

// 选房型后若编辑态，回填该房型的房间
watch(
  () => props.visible,
  async (val) => {
    if (!val) return
    if (props.order) {
      Object.assign(form, {
        guestName: props.order.guestName,
        guestPhone: props.order.guestPhone,
        guestIdCard: props.order.guestIdCard ?? '',
        roomId: props.order.roomId,
        roomTypeId: props.order.typeId,
        checkIn: props.order.checkIn?.slice(0, 10) ?? '',
        checkOut: props.order.checkOut?.slice(0, 10) ?? '',
        deposit: Number(props.order.deposit) || 0,
        remark: props.order.remark ?? '',
      })
      await onRoomTypeChange()
    } else {
      Object.assign(form, defaultForm())
      availableRooms.value = []
    }
    formRef.value?.clearValidate()
  }
)

const rules: FormRules = {
  guestName: [{ required: true, message: '请输入住客姓名', trigger: 'blur' }],
  guestPhone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' },
  ],
  roomTypeId: [{ required: true, message: '请选择房型', trigger: 'change' }],
  roomId: [{ required: true, message: '请选择房号', trigger: 'change', type: 'number', min: 1 }],
  checkIn: [{ required: true, message: '请选择入住日期', trigger: 'change' }],
  checkOut: [{ required: true, message: '请选择退房日期', trigger: 'change' }],
}

function disabledPast(date: Date): boolean {
  return date.getTime() < new Date(new Date().setHours(0, 0, 0, 0)).getTime()
}
function disabledBeforeCheckIn(date: Date): boolean {
  if (!form.checkIn) return disabledPast(date)
  return date.getTime() <= new Date(form.checkIn).getTime()
}

async function handleSubmit() {
  await formRef.value?.validate().catch(() => {})
  submitting.value = true
  try {
    const { guestName, guestPhone, guestIdCard, roomId, checkIn, checkOut, deposit, remark } = form
    const payload: CreateOrderDTO = { guestName, guestPhone, roomId, checkIn, checkOut }
    if (guestIdCard) payload.guestIdCard = guestIdCard
    if (deposit !== undefined) payload.deposit = deposit
    if (remark) payload.remark = remark

    if (isEdit.value && props.order) {
      await orderApi.update(props.order.id, payload)
      ElMessage.success('订单信息已更新')
    } else {
      await orderApi.create(payload)
      ElMessage.success('预订成功')
    }
    emit('update:visible', false)
    emit('saved')
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="less" scoped>
// 表单分区
.form-section {
  border: none;
  padding: 0;
  margin: 0 0 @space-lg;

  .section-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: @font-size-sm;
    font-weight: @font-weight-semibold;
    color: @primary;
    margin-bottom: @space-md;
    padding-bottom: @space-xs;
    border-bottom: 2px solid rgba(var(--primary-rgb), 0.12);
    width: 100%;
  }
}

// 计价预览
.price-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: @space-sm 0 0 88px;
  padding: @space-sm @space-md;
  background: rgba(var(--primary-rgb), 0.06);
  border-radius: @border-radius;
  border: 1px dashed rgba(var(--primary-rgb), 0.2);

  .preview-label {
    font-size: @font-size-sm;
    color: @text-secondary;
  }
  .preview-amount {
    font-size: @font-size-md;
    font-weight: @font-weight-extrabold;
    color: @primary;
  }
}

// 亮色模式 drawer 头部
[data-theme="light"] :deep(.el-drawer__header) {
  border-bottom: 1px solid @border-color;
  margin-bottom: 0;
  padding: @space-md @space-xl;
}

:deep(.el-drawer__body) {
  padding: @space-md @space-xl;
}
</style>
