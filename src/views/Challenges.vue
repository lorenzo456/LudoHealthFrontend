<script setup lang="ts">
import Card from '@/components/Card.vue'
import Navbar from '@/components/Navbar.vue'
import { getChallenges } from '@/api/Challenges'
import type { Challenge } from '@/types/Challenge'
import { ref, onMounted } from 'vue'

const challenges = ref<Challenge[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const response = await getChallenges()
    challenges.value = response.data
  } catch (error) {
    console.error('Error fetching challenges:', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <Navbar />
  <el-container>
    <el-main>
      <div class="challenges-container">
        <el-row :gutter="20">
          <el-col
            :span="8"
            v-for="n in 6"
            :key="n"
            style="display: flex; justify-content: center; margin-bottom: 20px"
          >
            <Card :id="n" title="Hello world" description="This is the temp description!" />
          </el-col>
        </el-row>
      </div>
    </el-main>
  </el-container>
</template>

<style scoped></style>
