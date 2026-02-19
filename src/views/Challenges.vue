<script setup lang="ts">
import Card from '@/components/Card.vue'
import Navbar from '@/components/Navbar.vue'
import { getActiveChallengesFromPlayer, getChallenges } from '@/api/Challenges'
import type { Challenge } from '@/types/Challenge'
import { ref, onMounted } from 'vue'

const challenges = ref<Challenge[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const response: Challenge[] = await getActiveChallengesFromPlayer(1)
    challenges.value = response
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
            v-for="n in challenges.length"
            :key="challenges[n - 1].id"
            :xs="24"
            :sm="24"
            :md="12"
            :lg="8"
            style="display: flex; justify-content: center; margin-bottom: 20px"
          >
            <Card
              :id="challenges[n - 1].id"
              :title="challenges[n - 1].title"
              :description="challenges[n - 1].name"
              :end_date="challenges[n - 1].end_date"
            />
          </el-col>
        </el-row>
      </div>
    </el-main>
  </el-container>
</template>

<style scoped></style>
