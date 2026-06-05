<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <el-icon class="header-icon"><OfficeBuilding /></el-icon>
        <h1>HR 管理系统</h1>
        <p>Human Resource Management</p>
      </div>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        size="large"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="用户名"
            :prefix-icon="User"
            clearable
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="密码"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            class="login-btn"
            :loading="loading"
            @click="handleLogin"
          >
            登 录
          </el-button>
        </el-form-item>
      </el-form>
      <p class="hint">测试账号：admin / password</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useStore } from '@/store'

const router = useRouter()
const store = useStore()
const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({ username: '', password: '' })

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

async function handleLogin() {
  await formRef.value?.validate()
  loading.value = true
  try {
    await store.dispatch('auth/login', form)
    router.push('/')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="less" scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, @primary 50%, #764ba2 100%);
  background-size: 400% 400%;
  animation: bg-shift 12s ease infinite;
}

@keyframes bg-shift {
  0%, 100% { background-position: 0% 50%; }
  50%      { background-position: 100% 50%; }
}

.login-card {
  width: 420px;
  background: @bg-card;
  border-radius: @border-radius-lg * 2;
  padding: @space-xl * 1.5;
  box-shadow: @shadow-lg;
  animation: slide-down 0.55s cubic-bezier(0.22, 1, 0.36, 1);
}

.login-header {
  text-align: center;
  margin-bottom: @space-xl;

  .header-icon {
    font-size: 48px;
    color: @primary;
    margin-bottom: @space-md;
    animation: scale-in 0.5s 0.15s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  h1 {
    font-size: @font-size-xl;
    font-weight: 700;
    color: @text-primary;
    margin-bottom: @space-xs;
    animation: fade-up 0.5s 0.25s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  p {
    color: @text-secondary;
    font-size: @font-size-sm;
    letter-spacing: 1px;
    animation: fade-up 0.5s 0.3s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
}

:deep(.el-form-item) {
  &:nth-child(1) { animation: fade-up 0.5s 0.35s cubic-bezier(0.22, 1, 0.36, 1) both; }
  &:nth-child(2) { animation: fade-up 0.5s 0.42s cubic-bezier(0.22, 1, 0.36, 1) both; }
  &:nth-child(3) { animation: fade-up 0.5s 0.49s cubic-bezier(0.22, 1, 0.36, 1) both; }
}

.login-btn {
  width: 100%;
  height: 46px;
  font-size: @font-size-md;
  letter-spacing: 4px;
  border-radius: @border-radius;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  &:hover {
    box-shadow: 0 6px 20px rgba(79, 106, 245, 0.35);
    transform: translateY(-1px);
  }
}

.hint {
  text-align: center;
  color: @text-placeholder;
  font-size: @font-size-xs;
  margin-top: @space-md;
  animation: fade-up 0.5s 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
}
</style>
