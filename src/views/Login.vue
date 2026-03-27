<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const auth = useAuthStore()

const form = reactive({ email: '', password: '' })
const loading = ref(false)

const handleLogin = async () => {
  if (!form.email || !form.password) {
    ElMessage.warning('Please fill in all fields')
    return
  }
  loading.value = true
  try {
    await auth.login(form.email, form.password)
    router.push('/')
  } catch {
    ElMessage.error('Invalid email or password')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-box">
      <div class="auth-logo">LudoHealth</div>
      <h2 class="auth-title">Welcome back</h2>
      <p class="auth-subtitle">Sign in to your account</p>

      <el-form label-position="top" class="auth-form" @submit.prevent="handleLogin">
        <el-form-item label="Email">
          <el-input
            v-model="form.email"
            type="email"
            placeholder="you@example.com"
            size="large"
          />
        </el-form-item>

        <el-form-item label="Password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="Your password"
            size="large"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-button
          type="primary"
          size="large"
          style="width: 100%; margin-top: 8px"
          :loading="loading"
          @click="handleLogin"
        >
          Sign in
        </el-button>
      </el-form>

      <p class="auth-switch">
        Don't have an account?
        <el-link type="primary" @click="router.push('/register')">Register</el-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f4f6f9;
}

.auth-box {
  background: #fff;
  border-radius: 16px;
  padding: 48px 40px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.auth-logo {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 24px;
}

.auth-title {
  margin: 0 0 6px;
  font-size: 22px;
  color: #303133;
}

.auth-subtitle {
  margin: 0 0 28px;
  color: #888;
  font-size: 14px;
}

.auth-switch {
  margin-top: 24px;
  text-align: center;
  font-size: 14px;
  color: #666;
}
</style>
