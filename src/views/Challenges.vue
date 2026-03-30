<script setup lang="ts">
import Card from '@/components/Card.vue'
import Navbar from '@/components/Navbar.vue'
import { getPlayerGroups, getGroupChallenges, getGroupProgress } from '@/api/Groups'
import type { Group } from '@/types/Group'
import type { Challenge } from '@/types/Challenge'
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const playerId = useAuthStore().player!.id

const groups = ref<Group[]>([])
const selectedGroup = ref<Group | null>(null)
const challenges = ref<Challenge[]>([])
const progress = ref<Record<number, { completed: number; total: number }>>({})
const loadingGroups = ref(true)
const loadingChallenges = ref(false)

onMounted(async () => {
  try {
    groups.value = await getPlayerGroups(playerId)
  } catch (error) {
    console.error('Error fetching groups:', error)
  } finally {
    loadingGroups.value = false
  }
})

const selectGroup = async (group: Group) => {
  selectedGroup.value = group
  loadingChallenges.value = true
  try {
    const [fetchedChallenges, fetchedProgress] = await Promise.all([
      getGroupChallenges(group.id),
      getGroupProgress(group.id, playerId),
    ])
    challenges.value = fetchedChallenges
    progress.value = Object.fromEntries(
      fetchedProgress.map((p) => [p.challenge_id, { completed: p.completed_tasks, total: p.total_tasks }])
    )
  } catch (error) {
    console.error('Error fetching group challenges:', error)
  } finally {
    loadingChallenges.value = false
  }
}

const goBack = () => {
  selectedGroup.value = null
  challenges.value = []
}

// Group challenges by level
const challengesByLevel = computed(() => {
  const map = new Map<number, Challenge[]>()
  for (const c of challenges.value) {
    const lvl = c.level ?? 1
    if (!map.has(lvl)) map.set(lvl, [])
    map.get(lvl)!.push(c)
  }
  return [...map.entries()].sort(([a], [b]) => a - b)
})

// A level is unlocked if it's level 1, or all challenges in the previous level are complete
const isLevelUnlocked = (level: number) => {
  if (level === 1) return true
  const prevChallenges = challengesByLevel.value.find(([lvl]) => lvl === level - 1)?.[1] ?? []
  return prevChallenges.every((c) => {
    const p = progress.value[c.id]
    return p && p.total > 0 && p.completed >= p.total
  })
}
</script>

<template>
  <Navbar />
  <el-container>
    <el-main>
      <div class="challenges-container">

        <!-- Groups view -->
        <template v-if="!selectedGroup">
          <div class="page-header">
            <h1>Your Groups</h1>
            <p>Select a group to view its challenges</p>
          </div>

          <el-row v-if="loadingGroups">
            <el-col :span="24">
              <el-skeleton :rows="4" animated />
            </el-col>
          </el-row>

          <div v-else-if="groups.length" class="group-list">
            <el-card
              v-for="group in groups"
              :key="group.id"
              class="group-card"
              shadow="hover"
              @click="selectGroup(group)"
            >
              <div class="group-banner">
                <span class="group-initial">{{ group.name.charAt(0).toUpperCase() }}</span>
              </div>
              <div class="group-content">
                <h3>{{ group.name }}</h3>
                <p v-if="group.description" class="group-description">{{ group.description }}</p>
                <el-tag :type="group.is_public ? 'success' : 'warning'" size="small">
                  {{ group.is_public ? 'Public' : 'Private' }}
                </el-tag>
              </div>
            </el-card>
          </div>

          <el-empty v-else description="You are not part of any groups" />
        </template>

        <!-- Challenges view -->
        <template v-else>
          <div class="group-header">
            <el-button @click="goBack">← Back to Groups</el-button>
            <h2>{{ selectedGroup.name }}</h2>
          </div>

          <el-row v-if="loadingChallenges">
            <el-col :span="24">
              <el-skeleton :rows="4" animated />
            </el-col>
          </el-row>

          <template v-else-if="challengesByLevel.length">
            <div
              v-for="([level, levelChallenges]) in challengesByLevel"
              :key="level"
              class="level-section"
            >
              <div class="level-header">
                <div class="level-badge" :class="{ locked: !isLevelUnlocked(level) }">
                  {{ isLevelUnlocked(level) ? `Level ${level}` : `🔒 Level ${level}` }}
                </div>
                <div class="level-line" />
              </div>

              <el-row :gutter="20">
                <el-col
                  v-for="challenge in levelChallenges"
                  :key="challenge.id"
                  :xs="24"
                  :sm="24"
                  :md="12"
                  :lg="8"
                  style="display: flex; justify-content: center; margin-bottom: 20px"
                >
                  <div class="card-wrapper" :class="{ locked: !isLevelUnlocked(level) }">
                    <Card
                      :id="challenge.id"
                      :title="challenge.name"
                      :description="challenge.category"
                      :completed-tasks="progress[challenge.id]?.completed ?? 0"
                      :total-tasks="progress[challenge.id]?.total ?? 0"
                      :points="challenge.points"
                    />
                    <div v-if="!isLevelUnlocked(level)" class="lock-overlay">
                      <span class="lock-icon">🔒</span>
                      <span class="lock-text">Complete Level {{ level - 1 }} to unlock</span>
                    </div>
                  </div>
                </el-col>
              </el-row>
            </div>
          </template>

          <el-empty v-else description="No challenges in this group" />
        </template>

      </div>
    </el-main>
  </el-container>
</template>

<style scoped>
.challenges-container {
  padding: 20px 0;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0 0 4px 0;
  font-size: 28px;
}

.page-header p {
  margin: 0;
  color: #888;
  font-size: 14px;
}

.group-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.group-card {
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
}

.group-card :deep(.el-card__body) {
  display: flex;
  align-items: center;
  padding: 0;
}

.group-banner {
  width: 80px;
  min-height: 80px;
  flex-shrink: 0;
  background: linear-gradient(135deg, #409eff, #67c23a);
  display: flex;
  align-items: center;
  justify-content: center;
}

.group-initial {
  font-size: 32px;
  font-weight: bold;
  color: white;
}

.group-content {
  padding: 0 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.group-content h3 {
  margin: 0;
}

.group-description {
  margin: 0;
  font-size: 13px;
  color: #888;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.group-header h2 {
  margin: 0;
}

.level-section {
  margin-bottom: 32px;
}

.level-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.level-badge {
  white-space: nowrap;
  font-weight: 600;
  font-size: 14px;
  color: #409eff;
  background: #ecf5ff;
  border: 1px solid #b3d8ff;
  border-radius: 20px;
  padding: 4px 14px;
}

.level-badge.locked {
  color: #909399;
  background: #f4f4f5;
  border-color: #d3d4d6;
}

.level-line {
  flex: 1;
  height: 1px;
  background: #e4e7ed;
}

.card-wrapper {
  position: relative;
}

.card-wrapper.locked {
  pointer-events: none;
}

.lock-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.75);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  backdrop-filter: blur(2px);
}

.lock-icon {
  font-size: 32px;
}

.lock-text {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}
</style>
