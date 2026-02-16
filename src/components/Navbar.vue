<template>
  <el-header>
    <el-row align="middle" class="nav-row">
      <!-- Logo -->
      <el-col :xs="16" :sm="4" :md="4">
        <h2 class="logo">LudoHealth</h2>
      </el-col>

      <el-col v-if="!isMobile" :md="12" :sm="12">
        <el-menu mode="horizontal" router :default-active="$route.path">
          <el-menu-item index="/">Home</el-menu-item>
          <el-menu-item index="/challenges">Challenges</el-menu-item>
        </el-menu>
      </el-col>

      <el-col v-if="isMobile" :xs="8" class="hamburger">
        <el-button text @click="drawer = true"> ☰ </el-button>
      </el-col>
    </el-row>

    <!-- Mobile Drawer -->
    <el-drawer v-model="drawer" direction="ltr" size="220px">
      <el-menu mode="vertical" router :default-active="$route.path" @select="drawer = false">
        <el-menu-item index="/">Home</el-menu-item>
        <el-menu-item index="/challenges">Challenges</el-menu-item>
      </el-menu>
    </el-drawer>
  </el-header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const drawer = ref(false)
const isMobile = ref(false)

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
</style>
