<template>
  <el-header class="nav-header">
    <el-row align="middle" class="nav-row">
      <el-col :xs="16" :sm="4" :md="4">
        <h2 class="logo">LudoHealth</h2>
      </el-col>

      <el-col v-if="!isMobile" :md="12" :sm="12">
        <el-menu mode="horizontal" router :default-active="$route.path">
          <el-menu-item index="/">Home</el-menu-item>
          <el-menu-item index="/challenges">Challenges</el-menu-item>
          <el-menu-item v-if="isAdmin" index="/challenges/create">Create Challenge</el-menu-item>
          <el-menu-item index="/profile">Profile</el-menu-item>
        </el-menu>
      </el-col>

      <el-col v-if="!isMobile" :md="4" :sm="4" style="display: flex; justify-content: flex-end; align-items: center">
        <el-button text @click="handleLogout">Logout</el-button>
      </el-col>

      <el-col v-if="isMobile" :xs="8" class="hamburger">
        <el-button text @click="drawer = true"> ☰ </el-button>
      </el-col>
    </el-row>

    <el-drawer v-model="drawer" direction="ltr" size="220px">
      <el-menu mode="vertical" router :default-active="$route.path" @select="drawer = false">
        <el-menu-item index="/">Home</el-menu-item>
        <el-menu-item index="/challenges">Challenges</el-menu-item>
        <el-menu-item v-if="isAdmin" index="/challenges/create">Create Challenge</el-menu-item>
        <el-menu-item index="/profile">Profile</el-menu-item>
      </el-menu>
      <div style="padding: 16px">
        <el-button style="width: 100%" @click="handleLogout">Logout</el-button>
      </div>
    </el-drawer>
  </el-header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const drawer = ref(false)
const isMobile = ref(false)
const auth = useAuthStore()
const isAdmin = auth.player?.role === 'admin'
const router = useRouter()

const handleLogout = () => {
  auth.logout()
  router.push('/login')
}

const checkScreen = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  checkScreen()
  window.addEventListener('resize', checkScreen)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreen)
})
</script>

<style scoped>
.nav-row {
  width: 100%;
}

.logo {
  margin: 0;
  color: #409eff;
}

.hamburger {
  display: flex;
  justify-content: flex-end;
}

.nav-header {
  position: sticky;
  top: 0;
  z-index: 1000;
}
</style>
