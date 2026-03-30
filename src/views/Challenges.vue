<script setup lang="ts">
import Card from '@/components/Card.vue'
import Navbar from '@/components/Navbar.vue'
import { getChallengeProgress } from '@/api/Challenges'
import { getPlayerGroups, getGroupChallenges } from '@/api/Groups'
import type { Group } from '@/types/Group'
import type { Challenge } from '@/types/Challenge'
import { ref, onMounted } from 'vue'
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
    const [fetchedGroups, fetchedProgress] = await Promise.all([
      getPlayerGroups(playerId),
      getChallengeProgress(playerId),
    ])
    groups.value = fetchedGroups
    progress.value = Object.fromEntries(
      fetchedProgress.map((p) => [p.challenge_id, { completed: p.completed_tasks, total: p.total_tasks }])
    )
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
    challenges.value = await getGroupChallenges(group.id)
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
            <el-button :icon="'ArrowLeft'" @click="goBack">Back to Groups</el-button>
            <h2>{{ selectedGroup.name }}</h2>
          </div>

          <el-row v-if="loadingChallenges">
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
  align-items: center;
  gap: 12px;
}

.group-content h3 {
  margin: 0;
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
</style>
