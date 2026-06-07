<template>
  <el-drawer
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
    :title="isEdit ? '编辑员工信息' : '新增员工'"
    size="520px"
    destroy-on-close
    class="emp-drawer"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="88px" label-position="right">
      <!-- 基本信息 -->
      <fieldset class="form-section">
        <legend class="section-title">
          <el-icon :size="14"><User /></el-icon> 基本信息
        </legend>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="form.gender">
            <el-radio-button value="male">男</el-radio-button>
            <el-radio-button value="female">女</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="头像">
          <el-input v-model="form.avatar" placeholder="图片 URL（可选）" />
        </el-form-item>
      </fieldset>

      <!-- 工作信息 -->
      <fieldset class="form-section">
        <legend class="section-title">
          <el-icon :size="14"><Briefcase /></el-icon> 工作信息
        </legend>
        <el-form-item label="部门" prop="departmentId">
          <el-select v-model="form.departmentId" placeholder="选择部门" style="width: 100%">
            <el-option v-for="d in deptFlat" :key="d.id" :label="d.name" :value="d.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="职位" prop="position">
          <el-input v-model="form.position" placeholder="请输入职位" />
        </el-form-item>
        <el-form-item label="薪资" prop="salary">
          <el-input-number
            v-model="form.salary"
            :min="1000"
            :max="999999"
            :step="1000"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="入职日期" prop="entryDate">
          <el-date-picker
            v-model="form.entryDate"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" style="width: 100%">
            <el-option label="在职" value="active" />
            <el-option label="试用期" value="probation" />
            <el-option label="离职" value="inactive" />
          </el-select>
        </el-form-item>
      </fieldset>

      <!-- 联系方式 -->
      <fieldset class="form-section">
        <legend class="section-title">
          <el-icon :size="14"><Phone /></el-icon> 联系方式
        </legend>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="example@company.com" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="1xxxxxxxxxx" />
        </el-form-item>
      </fieldset>
    </el-form>

    <template #footer>
      <el-button @click="$emit('update:visible', false)">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        {{ isEdit ? '保存修改' : '确认新增' }}
      </el-button>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { Employee, CreateEmployeeDTO } from '@/types/employee'
import { employeeApi } from '@/api/employee'
import { ElMessage } from 'element-plus'
import { User, Briefcase, Phone } from '@element-plus/icons-vue'

interface DeptOption { id: number; name: string; parentId?: number | null }

const props = defineProps<{
  visible: boolean
  employee: Employee | null
  deptFlat: DeptOption[]
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  saved: []
}>()

const formRef = ref<FormInstance>()
const submitting = ref(false)
const isEdit = computed(() => !!props.employee)

const defaultForm = (): CreateEmployeeDTO => ({
  name: '',
  gender: 'male',
  departmentId: 0,
  position: '',
  salary: 10000,
  entryDate: '',
  status: 'probation',
  email: '',
  phone: '',
  avatar: '',
})

const form = reactive<CreateEmployeeDTO>(defaultForm())

watch(
  () => props.visible,
  (val) => {
    if (val) {
      if (props.employee) {
        const dateStr = props.employee.entryDate?.slice(0, 10) ?? ''
        Object.assign(form, {
          name: props.employee.name,
          gender: props.employee.gender,
          departmentId: props.employee.departmentId,
          position: props.employee.position,
          salary: Number(props.employee.salary) || 0,
          entryDate: dateStr,
          status: props.employee.status,
          email: props.employee.email,
          phone: props.employee.phone,
          avatar: props.employee.avatar ?? '',
        })
      } else {
        Object.assign(form, defaultForm())
      }
      formRef.value?.clearValidate()
    }
  }
)

const rules: FormRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  departmentId: [{ required: true, message: '请选择部门', trigger: 'change', type: 'number', min: 1 }],
  position: [{ required: true, message: '请输入职位', trigger: 'blur' }],
  salary: [{ required: true, message: '请输入薪资', trigger: 'blur', type: 'number' }],
  entryDate: [{ required: true, message: '请选择入职日期', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' },
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' },
  ],
}

async function handleSubmit() {
  await formRef.value?.validate().catch(() => {})
  submitting.value = true
  try {
    const payload = { ...form }
    if (!payload.avatar) delete payload.avatar
    if (isEdit.value && props.employee) {
      await employeeApi.update(props.employee.id, payload)
      ElMessage.success('员工信息已更新')
    } else {
      await employeeApi.create(payload)
      ElMessage.success('员工创建成功')
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
