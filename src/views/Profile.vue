<script setup lang="ts">
import Navbar from '@/components/Navbar.vue'
import { getPlayer } from '@/api/Player'
import { getCompletedChallenges } from '@/api/Challenges'
import type { Player } from '@/types/Player'
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const playerId = useAuthStore().player!.id
const player = ref<Player | null>(null)
const completed = ref<{ challenge_id: number; name: string; category: string; points: number; total_tasks: number; completed_at: string }[]>([])

onMounted(async () => {
  try {
    [player.value, completed.value] = await Promise.all([
      getPlayer(playerId),
      getCompletedChallenges(playerId),
    ])
  } catch (error) {
    console.error('Error fetching profile:', error)
  }
})

const recentCompleted = computed(() => completed.value.slice(0, 3))

const categoryColor = (category: string) => {
  const map: Record<string, string> = {
    Physical: '#409eff',
    Cognitive: '#9b59b6',
    Social: '#67c23a',
  }
  return map[category] ?? '#909399'
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })

const settingsVisible = ref(false)
const googleFitConnected = ref(false)
</script>

<template>
  <Navbar />
  <el-container>
    <el-main>
      <div class="profile-container" v-if="player">

        <!-- Player card -->
        <el-row justify="center">
          <el-col :xs="22" :sm="16" :md="10" :lg="8">
            <el-card class="profile-card">
              <div class="settings-btn">
                <el-button text circle size="large" style="font-size: 22px" @click="settingsVisible = true">⚙️</el-button>
              </div>
              <div class="profile-body">
                <el-avatar src="https://i.pravatar.cc/150?img=47" :size="100" />
                <h2 class="player-name">{{ player.first_name }} {{ player.last_name }}</h2>
                <div class="points-badge">
                  <span class="points-value">{{ player.score.toFixed(0) }}</span>
                  <span class="points-label">points</span>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- Stats row -->
        <el-row justify="center" style="margin-top: 24px">
          <el-col :xs="22" :sm="16" :md="10" :lg="8">
            <el-card class="stat-card">
              <div class="stat-body">
                <span class="stat-value">{{ completed.length }}</span>
                <span class="stat-label">{{ completed.length === 1 ? 'Challenge' : 'Challenges' }} Completed</span>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- Recent completions -->
        <el-row justify="center" style="margin-top: 32px">
          <el-col :xs="22" :sm="16" :md="10" :lg="8">
            <h3 class="section-title">Recent Completions</h3>

            <div v-if="recentCompleted.length" class="completion-list">
              <el-card
                v-for="c in recentCompleted"
                :key="c.challenge_id"
                class="completion-card"
                shadow="hover"
              >
                <div class="completion-accent" :style="{ background: categoryColor(c.category) }" />
                <div class="completion-info">
                  <div class="completion-top">
                    <span class="completion-name">{{ c.name }}</span>
                    <span class="completion-points">+{{ c.points }} pts</span>
                  </div>
                  <div class="completion-meta">
                    <el-tag size="small" :color="categoryColor(c.category)" style="color: #fff; border: none">
                      {{ c.category }}
                    </el-tag>
                    <span class="completion-date">{{ formatDate(c.completed_at) }}</span>
                  </div>
                </div>
              </el-card>
            </div>

            <el-empty v-else description="No challenges completed yet" />
          </el-col>
        </el-row>

      </div>
    </el-main>
  </el-container>

  <el-drawer v-model="settingsVisible" title="Settings" direction="rtl" size="320px">
    <div class="settings-section">
      <h4 class="settings-heading">Account Integrations</h4>
      <div class="integration-row">
        <div class="integration-info">
          <svg class="integration-logo" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4z" fill="#EA4335"/>
              <path d="M24 4C12.95 4 4 12.95 4 24h20V4z" fill="#4285F4"/>
              <path d="M4 24c0 11.05 8.95 20 20 20V24H4z" fill="#34A853"/>
              <path d="M24 24h20C44 12.95 35.05 4 24 4v20z" fill="#FBBC05"/>
              <path d="M24 16c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8z" fill="#fff"/>
              <path d="M24 20c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" fill="#EA4335"/>
            </svg>
          <div>
            <div class="integration-name">Google Fit</div>
            <div class="integration-status">{{ googleFitConnected ? 'Connected' : 'Not connected' }}</div>
          </div>
        </div>
        <el-button
          :type="googleFitConnected ? 'danger' : 'primary'"
          size="small"
          plain
          @click="googleFitConnected = !googleFitConnected"
        >
          {{ googleFitConnected ? 'Disconnect' : 'Connect' }}
        </el-button>
      </div>
    </div>
  </el-drawer>
</template>

<style scoped>
.profile-container {
  padding: 40px 0 60px;
}

.profile-card {
  padding: 24px 16px;
  position: relative;
}

.settings-btn {
  position: absolute;
  top: 12px;
  right: 12px;
}

.settings-section {
  padding: 8px 0;
}

.settings-heading {
  margin: 0 0 16px 0;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #909399;
}

.integration-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.integration-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.integration-logo {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
}

.integration-name {
  font-weight: 600;
  font-size: 14px;
}

.integration-status {
  font-size: 12px;
  color: #909399;
}

.profile-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.player-name {
  margin: 0;
  font-size: 22px;
  color: #303133;
}

.points-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f0f9eb;
  border: 1px solid #b3e19d;
  border-radius: 12px;
  padding: 12px 32px;
  margin-top: 4px;
}

.points-value {
  font-size: 32px;
  font-weight: bold;
  color: #67c23a;
}

.points-label {
  font-size: 13px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.stat-card {
  text-align: center;
}

.stat-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 0;
}

.stat-value {
  font-size: 40px;
  font-weight: bold;
  color: #409eff;
  line-height: 1;
}

.stat-label {
  font-size: 13px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #606266;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.completion-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.completion-card :deep(.el-card__body) {
  display: flex;
  align-items: stretch;
  padding: 0;
}

.completion-accent {
  width: 6px;
  flex-shrink: 0;
  border-radius: 4px 0 0 4px;
}

.completion-info {
  flex: 1;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.completion-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.completion-name {
  font-weight: 600;
  color: #303133;
  font-size: 15px;
}

.completion-points {
  font-weight: 600;
  color: #67c23a;
  font-size: 14px;
}

.completion-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.completion-date {
  font-size: 12px;
  color: #aaa;
}
</style>
