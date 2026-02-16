<script setup lang="ts">
import { el } from 'element-plus/es/locales.mjs'
import Navbar from '@/components/Navbar.vue'
</script>

<template>
  <Navbar />
  <el-row>
    <el-col :span="2">Column 1 (33%)</el-col>
    <el-col :span="20">
      <h1 style="text-align: center">Hello this is the home page of the LudoHealth platform!!</h1>
    </el-col>
    <el-col :span="2">Column 3 (33%)</el-col>
  </el-row>
  <el-row>
    <el-col :span="12">Column 1 (50%)</el-col>
    <el-col :span="12">Column 2 (50%)</el-col>
  </el-row>

  <el-row>
    <el-col :span="8">Column 1 (33%)</el-col>
    <el-col :span="8">Column 2 (33%)</el-col>
    <el-col :span="8">Column 3 (33%)</el-col>
  </el-row>
</template>

<style scoped></style>
