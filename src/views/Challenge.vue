<script setup lang="ts">
import { ElMessage } from 'element-plus'
import Navbar from '@/components/Navbar.vue'
import { getChallengeById } from '@/api/Challenges'
import type { Challenge } from '@/types/Challenge'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const progress = ref(60)
const reflection = ref('')

const submitChallenge = () => {
  if (!reflection.value.trim()) {
    ElMessage.warning('Please write a short description before submitting.')
    return
  }
  // Add your submit logic here
  ElMessage.success('Challenge submitted successfully!')
}

const challenge = ref<Challenge | null>(null)
const loading = ref(true)
const error = ref(false)

onMounted(async () => {
  const challengeId = Number(route.params.id)
  console.log('Fetching challenge with ID:', challengeId)

  try {
    const response: Challenge = await getChallengeById(challengeId)
    challenge.value = response
    console.log('Fetched challenge:', challenge.value)
  } catch (err) {
    console.error('Error fetching challenge:', err)
    error.value = true
    ElMessage.error('Failed to load challenge')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <Navbar />

  <el-container>
    <el-main>
      <el-row>
        <el-col :span="2" />

        <el-col :span="20">
          <!-- Loading State -->
          <el-card v-if="loading" class="challenge-card">
            <el-skeleton :rows="8" animated />
          </el-card>

          <!-- Error State -->
          <el-card v-else-if="error" class="challenge-card">
            <el-empty description="Failed to load challenge">
              <el-button type="primary" @click="$router.push('/')"> Go Back Home </el-button>
            </el-empty>
          </el-card>

          <!-- Content State -->
          <el-card v-else-if="challenge" class="challenge-card">
            <h1 class="title">{{ challenge.name }}</h1>

            <div class="meta">
              <span class="date">{{ challenge.end_date }}</span>
              <el-tag type="info">Physical</el-tag>
              <span class="point">+50 points</span>
            </div>

            <!-- Description -->
            <p class="description">
              {{ challenge.description }}
            </p>

            <!-- Progress -->
            <div class="progress-section">
              <el-progress :percentage="progress" :stroke-width="18" />
              <p class="description">12/20 minutes completed</p>
            </div>

            <el-divider />

            <!-- Submission Section -->
            <div class="submission-section">
              <h3>Manually submit Your Completion</h3>

              <el-input
                v-model="reflection"
                type="textarea"
                placeholder="Describe how you completed this challenge..."
                :rows="4"
                resize="none"
              />

              <el-button type="primary" class="submit-btn" @click="submitChallenge">
                Submit Challenge
              </el-button>
            </div>
          </el-card>

          <!-- Fallback (shouldn't happen) -->
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

.point {
  font-weight: bold;
  color: #67c23a;
}

.date {
  color: #999;
}

.description {
  margin-bottom: 20px;
  line-height: 1.6;
}

.progress-section {
  margin-bottom: 20px;
}

.submission-section {
  margin-top: 20px;
}

.submit-btn {
  margin-top: 15px;
}
</style>
