<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
    :title="isEdit ? '编辑房型' : '新增房型'"
    width="480px"
    destroy-on-close
    class="type-dialog"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="88px" class="type-form">
      <el-form-item label="房型名称" prop="name">
        <el-input v-model="form.name" placeholder="如 豪华大床房" />
      </el-form-item>
      <el-form-item label="基础房价" prop="basePrice">
        <el-input-number
          v-model="form.basePrice"
          :min="0"
          :step="50"
          controls-position="right"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="床型" prop="bedType">
        <el-select v-model="form.bedType" style="width: 100%">
          <el-option v-for="b in BED_TYPE_OPTIONS" :key="b" :label="b" :value="b" />
        </el-select>
      </el-form-item>
      <el-form-item label="面积(㎡)">
        <el-input-number v-model="form.area" :min="0" :step="1" :precision="2" controls-position="right" style="width: 100%" />
      </el-form-item>
      <el-form-item label="可住人数" prop="maxGuests">
        <el-input-number v-model="form.maxGuests" :min="1" :max="10" controls-position="right" style="width: 100%" />
      </el-form-item>
      <el-form-item label="房型描述">
        <el-input v-model="form.description" type="textarea" :rows="2" placeholder="选填" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="$emit('update:visible', false)">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确认</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { RoomType, CreateRoomTypeDTO } from '@/types/room'
import { roomTypeApi } from '@/api/room'
import { ElMessage } from 'element-plus'
import { BED_TYPE_OPTIONS } from '@/constants'

const props = defineProps<{
  visible: boolean
  roomType: RoomType | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  saved: []
}>()

const formRef = ref<FormInstance>()
const submitting = ref(false)
const isEdit = computed(() => !!props.roomType)

const defaultForm = (): CreateRoomTypeDTO => ({
  name: '',
  basePrice: 388,
  bedType: '大床',
  area: undefined,
  maxGuests: 2,
  description: '',
})

const form = reactive<CreateRoomTypeDTO>(defaultForm())

watch(
  () => props.visible,
  (val) => {
    if (!val) return
    if (props.roomType) {
      Object.assign(form, {
        name: props.roomType.name,
        basePrice: Number(props.roomType.basePrice) || 0,
        bedType: props.roomType.bedType,
        area: props.roomType.area,
        maxGuests: props.roomType.maxGuests,
        description: props.roomType.description ?? '',
      })
    } else {
      Object.assign(form, defaultForm())
    }
    formRef.value?.clearValidate()
  }
)

const rules: FormRules = {
  name: [{ required: true, message: '请输入房型名称', trigger: 'blur' }],
  basePrice: [{ required: true, message: '请输入基础房价', trigger: 'blur', type: 'number', min: 0.01 }],
  bedType: [{ required: true, message: '请选择床型', trigger: 'change' }],
  maxGuests: [{ required: true, message: '请输入可住人数', trigger: 'blur', type: 'number' }],
}

async function handleSubmit() {
  await formRef.value?.validate().catch(() => {})
  submitting.value = true
  try {
    const payload = { ...form }
    if (!payload.description) delete payload.description
    if (payload.area === undefined || payload.area === null) delete payload.area

    if (isEdit.value && props.roomType) {
      await roomTypeApi.update(props.roomType.id, payload)
      ElMessage.success('房型信息已更新')
    } else {
      await roomTypeApi.create(payload)
      ElMessage.success('房型创建成功')
    }
    emit('update:visible', false)
    emit('saved')
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="less" scoped>
.type-form { padding: @space-sm 0; }
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: @space-sm;
}
</style>
