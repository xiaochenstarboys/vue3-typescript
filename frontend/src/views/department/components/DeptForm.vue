<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
    :title="isEdit ? '编辑部门' : '新增部门'"
    width="440px"
    destroy-on-close
    class="dept-dialog"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px" class="dept-form">
      <el-form-item label="部门名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入部门名称" />
      </el-form-item>
      <el-form-item label="上级部门">
        <el-select v-model="form.parentId" placeholder="顶级部门（可不选）" clearable style="width: 100%">
          <el-option v-for="d in availableParents" :key="d.id" :label="d.name" :value="d.id" />
        </el-select>
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
import type { Department, CreateDepartmentDTO } from '@/types/department'
import { departmentApi } from '@/api/department'
import { ElMessage } from 'element-plus'

interface DeptFlat { id: number; name: string; parentId?: number | null }

const props = defineProps<{
  visible: boolean
  department: Department | null
  deptFlat: DeptFlat[]
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  saved: []
}>()

const formRef = ref<FormInstance>()
const submitting = ref(false)
const isEdit = computed(() => !!props.department)
const form = reactive<CreateDepartmentDTO>({ name: '', parentId: null })

const availableParents = computed(() =>
  isEdit.value
    ? props.deptFlat.filter((d) => d.id !== props.department?.id)
    : props.deptFlat
)

watch(
  () => props.visible,
  (val) => {
    if (val) {
      form.name = props.department?.name ?? ''
      form.parentId = props.department?.parentId ?? null
      formRef.value?.clearValidate()
    }
  }
)

const rules: FormRules = {
  name: [{ required: true, message: '请输入部门名称', trigger: 'blur' }],
}

async function handleSubmit() {
  await formRef.value?.validate().catch(() => {})
  submitting.value = true
  try {
    if (isEdit.value && props.department) {
      await departmentApi.update(props.department.id, { ...form })
      ElMessage.success('部门信息已更新')
    } else {
      await departmentApi.create({ ...form })
      ElMessage.success('部门创建成功')
    }
    emit('update:visible', false)
    emit('saved')
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="less" scoped>
.dept-form {
  padding: @space-sm 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: @space-sm;
}
</style>
