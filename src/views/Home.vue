<script setup lang="ts">
import Navbar from '@/components/Navbar.vue'
import ActivityCard from '@/components/ActivityCard.vue'
import { Activity } from '@/types/Activity'
import { ref, onMounted } from 'vue'
import { getUserActivities } from '@/api/Activities'
import { useAuthStore } from '@/stores/auth'

const playerId = useAuthStore().player!.id
const activities = ref<Activity[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const response = await getUserActivities(playerId)
    // Deduplicate Google Fit activities: show only the first entry per date
    // (evaluate_activities creates clone rows per matched task; we only show the original)
    const seen = new Set<string>()
    activities.value = response.filter(a => {
      if (a.source !== 'google_fit') return true
      const key = a.created_at.slice(0, 10)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  } catch (error) {
    console.error('Error fetching activities:', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <el-container class="container-layout">
    <Navbar />
    <el-main>
      <el-row justify="center">
        <el-col :span="12">
          <div style="display: flex; flex-direction: column; align-items: center; margin-top: 20px">
            <ActivityCard
              v-for="activity in activities"
              :key="activity.id"
              :activity="activity"
              style="margin-bottom: 20px"
            />
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
