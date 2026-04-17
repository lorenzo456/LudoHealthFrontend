<script setup lang="ts">
import { ElMessage } from 'element-plus'
import Navbar from '@/components/Navbar.vue'
import { getChallengeById, getChallengeTasks, getTaskProperties, getTaskCompletions } from '@/api/Challenges'
import type { Challenge } from '@/types/Challenge'
import type { Task } from '@/types/Task'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { postActivity } from '@/api/Activities'

import { useAuthStore } from '@/stores/auth'
const PLAYER_ID = useAuthStore().player!.id

const route = useRoute()

const challenge = ref<Challenge | null>(null)
const tasks = ref<Task[]>([])
const completions = ref<Record<number, number>>({})
const loading = ref(true)
const error = ref(false)

const isModalVisible = ref(false)
const selectedTask = ref<Task | null>(null)
const isCongratulationsVisible = ref(false)
const pointsEarned = ref(0)

const isTaskDone = (task: Task) => (completions.value[task.id] ?? 0) >= task.frequency
const remaining = (task: Task) => Math.max(0, task.frequency - (completions.value[task.id] ?? 0))

const handleTaskClick = (task: Task) => {
  if (isTaskDone(task)) return
  selectedTask.value = task
  isModalVisible.value = true
}

const handleConfirm = async () => {
  if (!selectedTask.value) return
  const properties = selectedTask.value.properties.map((p) => ({
    activity_property_id: p.activity_property_id,
    value: p.threshold_value ?? 1,
  }))
  try {
    const result = await postActivity({
      activity_type_id: selectedTask.value.activity_type_id,
      task_id: selectedTask.value.id,
      properties,
    })
    await fetchCompletions(Number(route.params.id))
    isModalVisible.value = false
    if (result.points_awarded > 0) {
      pointsEarned.value = result.points_awarded
      isCongratulationsVisible.value = true
    } else {
      ElMessage.success(`Logged: ${selectedTask.value.name}`)
    }
  } catch {
    ElMessage.error('Failed to log activity')
  }
}

const fetchCompletions = async (challengeId: number) => {
  const rows = await getTaskCompletions(challengeId, PLAYER_ID)
  completions.value = Object.fromEntries(rows.map((r) => [r.task_id, r.completions]))
}

onMounted(async () => {
  const challengeId = Number(route.params.id)

  try {
    challenge.value = await getChallengeById(challengeId)
  } catch {
    error.value = true
    ElMessage.error('Failed to load challenge')
  } finally {
    loading.value = false
  }

  try {
    const fetchedTasks = await getChallengeTasks(challengeId)
    for (const task of fetchedTasks) {
      task.properties = await getTaskProperties(task.id)
    }
    tasks.value = fetchedTasks
    await fetchCompletions(challengeId)
  } catch {
    ElMessage.error('Failed to load tasks')
  }
})
</script>

<template>
  <Navbar />

  <el-dialog
    v-model="isCongratulationsVisible"
    title="Challenge Complete!"
    width="420px"
    :close-on-click-modal="false"
    center
  >
    <div class="congrats-body">
      <div class="congrats-icon">🏆</div>
      <p class="congrats-title">Congratulations!</p>
      <p class="congrats-message">
        You've completed <strong>{{ challenge?.name }}</strong> and earned
        <span class="congrats-points">{{ pointsEarned }} points</span>!
      </p>
    </div>
    <template #footer>
      <el-button type="primary" @click="isCongratulationsVisible = false">Awesome!</el-button>
    </template>
  </el-dialog>

  <el-dialog
    v-model="isModalVisible"
    :title="selectedTask?.name"
    width="500px"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    center
  >
    <div v-if="selectedTask">
      <p>Do you want to log <strong>{{ selectedTask.name }}</strong>?</p>
      <p style="color: #888; font-size: 13px">{{ selectedTask.description }}</p>
    </div>
    <template #footer>
      <el-button @click="isModalVisible = false">Cancel</el-button>
      <el-button type="primary" @click="handleConfirm">Log activity</el-button>
    </template>
  </el-dialog>

  <el-container>
    <el-main>
      <el-row>
        <el-col :span="2" />
        <el-col :span="20">

          <el-card v-if="loading" class="challenge-card">
            <el-skeleton :rows="8" animated />
          </el-card>

          <el-card v-else-if="error" class="challenge-card">
            <el-empty description="Failed to load challenge">
              <el-button type="primary" @click="$router.push('/')">Go Back</el-button>
            </el-empty>
          </el-card>

          <el-card v-else-if="challenge" class="challenge-card">
            <h1 class="title">{{ challenge.name }}</h1>
            <div class="meta">
              <el-tag type="info">{{ challenge.category }}</el-tag>
              <span class="date">ends {{ challenge.end_date }}</span>
            </div>

            <el-divider />

            <div v-if="tasks.length">
              <h3>Tasks</h3>
              <el-row :gutter="16">
                <el-col v-for="task in tasks" :key="task.id" :span="24" style="margin-bottom: 10px">
                  <el-card
                    shadow="hover"
                    class="task-card"
                    :class="{ 'task-done': isTaskDone(task) }"
                    @click="handleTaskClick(task)"
                  >
                    <div class="task-header">
                      <strong>{{ task.name }}</strong>
                      <el-tag :type="isTaskDone(task) ? 'success' : 'info'" size="small">
                        {{ isTaskDone(task) ? 'Done' : `${remaining(task)} left` }}
                      </el-tag>
                    </div>
                    <p class="task-description">{{ task.description }}</p>
                  </el-card>
                </el-col>
              </el-row>
            </div>

            <el-empty v-else description="No tasks for this challenge" />
          </el-card>

          <el-card v-else class="challenge-card">
            <el-empty description="Challenge not found" />
          </el-card>

        </el-col>
        <el-col :span="2" />
      </el-row>
    </el-main>
  </el-container>
</template>

<style scoped>
.challenge-card {
  padding: 25px;
  margin-top: 30px;
}

.title {
  margin-bottom: 10px;
}

.meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.date {
  color: #999;
}

.task-card {
  cursor: pointer;
}

.task-done {
  opacity: 0.5;
  cursor: not-allowed;
}

.congrats-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 8px 0 16px;
  text-align: center;
}

.congrats-icon {
  font-size: 48px;
}

.congrats-title {
  font-size: 22px;
  font-weight: bold;
  margin: 0;
  color: #303133;
}

.congrats-message {
  font-size: 15px;
  color: #555;
  margin: 0;
}

.congrats-points {
  font-weight: bold;
  color: #67c23a;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.task-description {
  margin: 0;
  color: #666;
  font-size: 13px;
}
</style>
