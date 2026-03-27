<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const auth = useAuthStore()

const form = reactive({
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  confirm_password: '',
})
const loading = ref(false)

const handleRegister = async () => {
  if (!form.first_name || !form.last_name || !form.email || !form.password) {
    ElMessage.warning('Please fill in all fields')
    return
  }
  if (form.password !== form.confirm_password) {
    ElMessage.warning('Passwords do not match')
    return
  }
  loading.value = true
  try {
    await auth.register(form.first_name, form.last_name, form.email, form.password)
    router.push('/')
  } catch {
    ElMessage.error('Registration failed — email may already be in use')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-box">
      <div class="auth-logo">LudoHealth</div>
      <h2 class="auth-title">Create an account</h2>
      <p class="auth-subtitle">Start your health journey today</p>

      <el-form label-position="top" class="auth-form">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="First name">
              <el-input v-model="form.first_name" placeholder="Alice" size="large" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Last name">
              <el-input v-model="form.last_name" placeholder="Johnson" size="large" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="Email">
          <el-input v-model="form.email" type="email" placeholder="you@example.com" size="large" />
        </el-form-item>

        <el-form-item label="Password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="Create a password"
            size="large"
            show-password
          />
        </el-form-item>

        <el-form-item label="Confirm password">
          <el-input
            v-model="form.confirm_password"
            type="password"
            placeholder="Repeat your password"
            size="large"
            show-password
            @keyup.enter="handleRegister"
          />
        </el-form-item>

        <el-button
          type="primary"
          size="large"
          style="width: 100%; margin-top: 8px"
          :loading="loading"
          @click="handleRegister"
        >
          Create account
        </el-button>
      </el-form>

      <p class="auth-switch">
        Already have an account?
        <el-link type="primary" @click="router.push('/login')">Sign in</el-link>
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
  max-width: 440px;
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
