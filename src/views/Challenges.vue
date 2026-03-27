<script setup lang="ts">
import Card from '@/components/Card.vue'
import Navbar from '@/components/Navbar.vue'
import { getPlayerChallenges, getChallengeProgress } from '@/api/Challenges'
import type { Challenge } from '@/types/Challenge'
import { ref, onMounted } from 'vue'

const challenges = ref<Challenge[]>([])
const progress = ref<Record<number, { completed: number; total: number }>>({})
const loading = ref(true)

onMounted(async () => {
  try {
    const [fetchedChallenges, fetchedProgress] = await Promise.all([
      getPlayerChallenges(1),
      getChallengeProgress(1),
    ])
    challenges.value = fetchedChallenges
    progress.value = Object.fromEntries(
      fetchedProgress.map((p) => [p.challenge_id, { completed: p.completed_tasks, total: p.total_tasks }])
    )
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
        <el-row v-if="loading">
          <el-col :span="24">
            <el-skeleton :rows="4" animated />
          </el-col>
        </el-row>

        <el-row v-else-if="challenges.length" :gutter="20">
          <el-col
            v-for="challenge in challenges"
            :key="challenge.id"
            :xs="24"
            :sm="24"
            :md="12"
            :lg="8"
            style="display: flex; justify-content: center; margin-bottom: 20px"
          >
            <Card
              :id="challenge.id"
              :title="challenge.name"
              :description="challenge.category"
              :completed-tasks="progress[challenge.id]?.completed ?? 0"
              :total-tasks="progress[challenge.id]?.total ?? 0"
            />
          </el-col>
        </el-row>

        <el-empty v-else description="No challenges found" />
      </div>
    </el-main>
  </el-container>
</template>

<style scoped></style>
