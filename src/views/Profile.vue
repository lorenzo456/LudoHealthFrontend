<script setup lang="ts">
import Navbar from '@/components/Navbar.vue'
import { getPlayer } from '@/api/Player'
import { getCompletedChallenges, evaluateActivities } from '@/api/Challenges'
import { postActivity } from '@/api/Activities'
import type { Player } from '@/types/Player'
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
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

  if (healthConnectConnected.value) fetchWalkingData()

  const waitForGoogle = setInterval(() => {
    if ((window as any).google) { initTokenClient(); clearInterval(waitForGoogle) }
  }, 200)
  setTimeout(() => clearInterval(waitForGoogle), 10000)
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

const maxSteps = computed(() => Math.max(...walkingData.value.map(d => d.steps), 1))
const barHeight = (steps: number) => Math.round((steps / maxSteps.value) * 100)

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })

const settingsVisible = ref(false)
const healthConnectConnected = ref(!!localStorage.getItem('hc_access_token'))
const healthConnectConnecting = ref(false)

interface DaySteps { date: string; steps: number }
const walkingData = ref<DaySteps[]>([])
const loadingWalking = ref(false)
const lastSynced = ref<Date | null>(null)
const lastSyncedLabel = computed(() => {
  if (!lastSynced.value) return null
  const diff = Math.floor((Date.now() - lastSynced.value.getTime()) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
})

const fetchWalkingData = async () => {
  const token = localStorage.getItem('hc_access_token')
  if (!token) return

  loadingWalking.value = true
  try {
    const now = Date.now()
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000

    const res = await fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        aggregateBy: [{ dataTypeName: 'com.google.step_count.delta' }],
        bucketByTime: { durationMillis: 86400000 },
        startTimeMillis: sevenDaysAgo,
        endTimeMillis: now,
      }),
    })

    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('hc_access_token')
        healthConnectConnected.value = false
        ElMessage.warning('Health Connect session expired — please reconnect')
      }
      return
    }

    const data = await res.json()
    const syncedSteps: Record<string, number> = JSON.parse(localStorage.getItem('hc_synced_steps') ?? '{}')
    const today = new Date().toISOString().slice(0, 10)

    const buckets: { startTimeMillis: string; dataset: { point: { value: { intVal: number }[] }[] }[] }[] = data.bucket
    walkingData.value = buckets.map(bucket => ({
      date: new Date(Number(bucket.startTimeMillis)).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
      steps: bucket.dataset[0]?.point?.reduce((sum: number, p: { value: { intVal: number }[] }) => sum + (p.value[0]?.intVal ?? 0), 0) ?? 0,
    }))

    let anyNewActivities = false
    for (const bucket of buckets) {
      const isoDate = new Date(Number(bucket.startTimeMillis)).toISOString().slice(0, 10)
      const steps = bucket.dataset[0]?.point?.reduce(
        (sum: number, p: { value: { intVal: number }[] }) => sum + (p.value[0]?.intVal ?? 0), 0
      ) ?? 0

      // Always re-sync today; skip past days already submitted with the same count
      const alreadySynced = syncedSteps[isoDate] !== undefined
      const stepsDelta = steps - (syncedSteps[isoDate] ?? 0)
      if (steps === 0 || (alreadySynced && isoDate !== today) || stepsDelta <= 0) continue

      await postActivity({
        player_id: playerId,
        activity_type_id: 1,
        source: 'google_fit',
        created_at: isoDate,
        properties: [{ activity_property_id: 1, value: stepsDelta }],
      })
      syncedSteps[isoDate] = steps
      anyNewActivities = true
    }

    localStorage.setItem('hc_synced_steps', JSON.stringify(syncedSteps))
    lastSynced.value = new Date()

    if (anyNewActivities) {
      const { points_awarded } = await evaluateActivities(playerId)
      if (points_awarded > 0) ElMessage.success(`+${points_awarded} pts from Health Connect steps!`)
    }
  } catch {
    ElMessage.error('Failed to fetch Health Connect data')
  } finally {
    loadingWalking.value = false
  }
}

const HC_CLIENT_ID = '353082866996-rp2937pgee8avk79il0611h2348l31r4.apps.googleusercontent.com'
const HC_SCOPES = [
  'https://www.googleapis.com/auth/fitness.activity.read',
  'https://www.googleapis.com/auth/fitness.body.read',
  'https://www.googleapis.com/auth/fitness.sleep.read',
].join(' ')

let tokenClient: any = null

const initTokenClient = () => {
  const google = (window as any).google
  if (!google) return
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: HC_CLIENT_ID,
    scope: HC_SCOPES,
    callback: (response: any) => {
      healthConnectConnecting.value = false
      if (response.error) {
        ElMessage.error('Failed to connect Health Connect')
        return
      }
      localStorage.setItem('hc_access_token', response.access_token)
      healthConnectConnected.value = true
      ElMessage.success('Health Connect connected!')
      fetchWalkingData()
    },
  })
}

const connectHealthConnect = () => {
  if (!tokenClient) initTokenClient()
  if (!tokenClient) { ElMessage.error('Google services not loaded yet'); return }
  healthConnectConnecting.value = true
  tokenClient.requestAccessToken()
}

const disconnectHealthConnect = () => {
  const token = localStorage.getItem('hc_access_token')
  if (token) (window as any).google?.accounts.oauth2.revoke(token)
  localStorage.removeItem('hc_access_token')
  localStorage.removeItem('hc_synced_steps')
  healthConnectConnected.value = false
  walkingData.value = []
  lastSynced.value = null
  ElMessage.success('Health Connect disconnected')
}

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

        <!-- Walking activity -->
        <el-row v-if="healthConnectConnected" justify="center" style="margin-top: 32px">
          <el-col :xs="22" :sm="16" :md="10" :lg="8">
            <div class="section-title-row">
              <h3 class="section-title" style="margin: 0">Steps — Last 7 Days</h3>
              <div class="sync-meta">
                <span v-if="lastSyncedLabel" class="sync-label">synced {{ lastSyncedLabel }}</span>
                <el-button size="small" :loading="loadingWalking" @click="fetchWalkingData">Sync</el-button>
              </div>
            </div>

            <el-card v-if="loadingWalking" class="steps-card">
              <el-skeleton :rows="3" animated />
            </el-card>

            <el-card v-else-if="walkingData.length" class="steps-card">
              <div class="steps-chart">
                <div
                  v-for="day in walkingData"
                  :key="day.date"
                  class="steps-bar-col"
                >
                  <span class="steps-count">{{ day.steps.toLocaleString() }}</span>
                  <div class="steps-bar-track">
                    <div
                      class="steps-bar-fill"
                      :style="{ height: barHeight(day.steps) + '%' }"
                    />
                  </div>
                  <span class="steps-date">{{ day.date }}</span>
                </div>
              </div>
            </el-card>

            <el-empty v-else description="No step data available" />
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
              <defs>
                <linearGradient id="hc-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#4285F4"/>
                  <stop offset="100%" stop-color="#34A853"/>
                </linearGradient>
              </defs>
              <rect width="48" height="48" rx="12" fill="url(#hc-grad)"/>
              <path d="M24 34s-11-7.5-11-14a7 7 0 0 1 11-5.74A7 7 0 0 1 35 20c0 6.5-11 14-11 14z" fill="#fff"/>
            </svg>
          <div>
            <div class="integration-name">Health Connect</div>
            <div class="integration-status">{{ healthConnectConnected ? 'Connected' : 'Not connected' }}</div>
          </div>
        </div>
        <el-button
          :type="healthConnectConnected ? 'danger' : 'primary'"
          size="small"
          plain
          :loading="healthConnectConnecting"
          @click="healthConnectConnected ? disconnectHealthConnect() : connectHealthConnect()"
        >
          {{ healthConnectConnected ? 'Disconnect' : 'Connect' }}
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

.section-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.sync-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sync-label {
  font-size: 12px;
  color: #aaa;
}

.steps-card {
  padding: 8px 0;
}

.steps-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 8px 0;
  height: 160px;
}

.steps-bar-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  height: 100%;
}

.steps-count {
  font-size: 10px;
  color: #606266;
  font-weight: 600;
  white-space: nowrap;
}

.steps-bar-track {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
}

.steps-bar-fill {
  width: 100%;
  background: linear-gradient(to top, #409eff, #79bbff);
  border-radius: 4px 4px 0 0;
  min-height: 4px;
  transition: height 0.4s ease;
}

.steps-date {
  font-size: 10px;
  color: #aaa;
  text-align: center;
  white-space: nowrap;
}
</style>
