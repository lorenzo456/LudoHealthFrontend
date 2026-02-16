<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import Navbar from '@/components/Navbar.vue'

const progress = ref(60)
const reflection = ref('')

const submitChallenge = () => {
  ElMessage.warning('Please write a short description before submitting.')
}
</script>

<template>
  <Navbar />

  <el-container>
    <el-main>
      <el-row>
        <el-col :span="2" />

        <el-col :span="20">
          <el-card class="challenge-card">
            <h1 class="title">Daily 20 Minute Walk</h1>

            <div class="meta">
              <span class="date">Due: March 30, 2025</span>
              <el-tag type="info">Physical</el-tag>
              <span class="point">+50 points </span>
            </div>

            <!-- Description -->
            <p class="description">
              Take a 20 minute walk outside to improve cardiovascular health. Maintain a steady pace
              and reflect on how you felt during the activity.
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
