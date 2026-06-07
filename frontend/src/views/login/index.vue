<template>
  <div class="login-page">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="orb orb-1" />
      <div class="orb orb-2" />
      <div class="orb orb-3" />
    </div>

    <!-- 卡片 -->
    <div class="login-card">
      <div class="card-header">
        <div class="logo-icon">
          <el-icon :size="28"><OfficeBuilding /></el-icon>
        </div>
        <h1 class="title">HR 管理系统</h1>
        <p class="subtitle">企业人力资源管理平台</p>
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
            placeholder="请输入用户名"
            :prefix-icon="User"
            clearable
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            class="login-btn"
            :loading="loading"
            size="large"
            @click="handleLogin"
          >
            <span v-if="!loading">登 录</span>
          </el-button>
        </el-form-item>
      </el-form>

      <p class="hint">
        演示账号 admin · 密码 password
      </p>
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
  background: @bg-page;
  position: relative;
  overflow: hidden;
}

// 背景光晕
.bg-decoration {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.12;
  animation: orb-drift 12s ease-in-out infinite;
}

.orb-1 {
  width: 500px;
  height: 500px;
  background: @primary;
  top: -15%;
  left: -10%;
  animation-delay: 0s;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: @accent;
  bottom: -10%;
  right: -8%;
  animation-delay: -4s;
}

.orb-3 {
  width: 300px;
  height: 300px;
  background: @primary-light;
  top: 50%;
  left: 55%;
  animation-delay: -8s;
  opacity: 0.08;
}

@keyframes orb-drift {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -20px) scale(1.05); }
  66% { transform: translate(-15px, 15px) scale(0.95); }
}

// 卡片
.login-card {
  width: 420px;
  background: @bg-card-raised;
  border: 1px solid @border-color;
  border-radius: 20px;
  padding: 44px 40px;
  box-shadow: @shadow-lg;
  position: relative;
  z-index: 1;
  backdrop-filter: blur(20px);
  animation: card-in 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes card-in {
  from { opacity: 0; transform: translateY(20px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.card-header {
  text-align: center;
  margin-bottom: @space-xl;

  .logo-icon {
    width: 60px;
    height: 60px;
    border-radius: 16px;
    background: linear-gradient(135deg, @primary, @accent);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    margin: 0 auto @space-md;
    box-shadow: 0 8px 24px rgba(var(--primary-rgb), 0.3);
  }

  .title {
    font-size: 26px;
    font-weight: @font-weight-extrabold;
    color: @text-primary;
    margin: 0 0 @space-xs;
    letter-spacing: 0.02em;
  }

  .subtitle {
    color: @text-secondary;
    font-size: @font-size-sm;
    margin: 0;
  }
}

// 表单动画
:deep(.el-form-item) {
  &:nth-child(1) { animation: fade-up 0.4s 0.15s cubic-bezier(0.4, 0, 0.2, 1) both; }
  &:nth-child(2) { animation: fade-up 0.4s 0.22s cubic-bezier(0.4, 0, 0.2, 1) both; }
  &:nth-child(3) { animation: fade-up 0.4s 0.29s cubic-bezier(0.4, 0, 0.2, 1) both; }
}

@keyframes fade-up {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.login-btn {
  width: 100%;
  height: 48px;
  font-size: @font-size-md;
  font-weight: @font-weight-bold;
  letter-spacing: 8px;
  border-radius: @border-radius;
  transition: all 0.2s ease;

  &:not(:disabled):active {
    transform: scale(0.98);
  }
}

.hint {
  text-align: center;
  color: @text-placeholder;
  font-size: @font-size-xs;
  margin: @space-md 0 0;
  line-height: 1.5;
  opacity: 0.7;
}

// 响应式
@media (max-width: 480px) {
  .login-card {
    width: 92%;
    padding: 32px 24px;
  }
}
</style>
