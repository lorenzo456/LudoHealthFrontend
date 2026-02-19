<script setup lang="ts">
import { el } from 'element-plus/es/locales.mjs'
import Navbar from '@/components/Navbar.vue'
import ActivityCard from '@/components/ActivityCard.vue'
</script>

<template>
  <el-container class="container-layout">
    <Navbar />
    <el-main>
      <el-row justify="center">
        <el-col :span="12">
          <div style="display: flex; flex-direction: column; align-items: center; margin-top: 20px">
            <ActivityCard v-for="n in 50" :key="n" style="margin-bottom: 20px" />
          </div>
        </el-col>
      </el-row>
    </el-main>
    <el-footer>
      <el-row>
        <el-col :span="12" style="text-align: left">
          &copy; 2024 LudoHealth. All rights reserved.
        </el-col>
        <el-col :span="12" style="text-align: right">
          <a href="/privacy-policy">Privacy Policy</a> | <a href="/terms">Terms of Service</a>
        </el-col>
      </el-row>
    </el-footer>
  </el-container>
</template>

<style scoped>
.container-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.container-layout :deep(> .el-main) {
  flex: 1;
}
</style>
