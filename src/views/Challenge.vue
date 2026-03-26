<script setup lang="ts">
import { ElMessage } from 'element-plus'
import Navbar from '@/components/Navbar.vue'
import { getChallengeById, getChallengeRules, getRuleProperties } from '@/api/Challenges'
import type { Challenge } from '@/types/Challenge'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Rule } from '@/types/Rule'
import { postActivity } from '@/api/Activities'

const route = useRoute()

const challenge = ref<Challenge | null>(null)
const rules = ref<Rule[] | null>(null)
const loading = ref(true)
const error = ref(false)

const isChallengeModalVisible = ref(false)
const selectedRule = ref<Rule | null>(null)
const propertyValues = ref<Record<number, number | string>>({})

const handleRuleClick = (rule: Rule) => {
  if (rule.device_id === 1) {
    selectedRule.value = rule
    propertyValues.value = Object.fromEntries(
      rule.properties.map((p) => [p.activity_property_id, p.unit === 'text' ? '' : 0]),
    )
    isChallengeModalVisible.value = true
  }
}

const submitActivity = async () => {
  if (!selectedRule.value || !selectedRule.value.properties.length) return
  try {
    await postActivity({
      player_id: 1,
      device_id: selectedRule.value.device_id,
      activity_type_id: selectedRule.value.activity_type_id,
      properties: Object.entries(propertyValues.value).map(([id, value]) => ({
        activity_property_id: Number(id),
        value,
      })),
    })
    ElMessage.success(`Activity submitted for: ${selectedRule.value.name}`)
  } catch {
    ElMessage.error('Failed to submit activity')
  }
}

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

  try {
    const rulesResponse: Rule[] = await getChallengeRules(challengeId)
    console.log('Fetched rules response:', rulesResponse)
    rules.value = rulesResponse
  } catch (err) {
    console.error('Error fetching rules:', err)
    error.value = true
    ElMessage.error('Failed to load challenge rules')
  } finally {
    loading.value = false
  }

  try {
    for (const rule of rules.value || []) {
      const properties: Property[] = await getRuleProperties(rule.id)
      rule.properties = properties
    }
  } catch (err) {
    console.error('Error logging rule properties:', err)
  }
})
</script>

<template>
  <Navbar />

  <!-- Challenge Modal -->
  <el-dialog
    v-model="isChallengeModalVisible"
    :title="selectedRule?.name || 'Rule Details'"
    width="500px"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    center
  >
    <div v-if="selectedRule">
      <p>
        <strong>
          Manually registering <em>{{ selectedRule.name }}</em> activity
        </strong>
      </p>
      <el-form label-position="top" style="margin-top: 12px">
        <el-form-item
          v-for="prop in selectedRule.properties"
          :key="prop.activity_property_id"
          :label="prop.name"
        >
          <el-input
            v-if="prop.unit === 'text'"
            v-model="propertyValues[prop.activity_property_id]"
            style="width: 100%"
          />
          <el-input-number
            v-else
            v-model="(propertyValues[prop.activity_property_id] as number)"
            :min="0"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
    </div>
    <template v-slot:footer v-if="selectedRule">
      <span class="dialog-footer">
        <el-button @click="isChallengeModalVisible = false">Cancel</el-button>
        <el-button type="primary" @click="(submitActivity(), (isChallengeModalVisible = false))">
          Submit activity manually
        </el-button>
      </span>
    </template>
  </el-dialog>

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
              <!-- <el-tag type="info">Physical</el-tag> -->
              <!-- <span class="point">+50 points</span> -->
            </div>

            <!-- Description -->
            <p class="description">
              {{ challenge.description }}
            </p>

            <el-divider />

            <!-- rules -->
            <div class="rules-section" v-if="rules && rules.length" style="margin-bottom: 20px">
              <h3>Activities</h3>
              <el-row :gutter="16">
                <el-col v-for="rule in rules" :key="rule.id" :span="24" style="margin-bottom: 10px">
                  <div
                    :style="{
                      border: rule.device_id == 1 ? '1px solid rebeccapurple' : 'none',
                      cursor: rule.device_id == 1 ? 'pointer' : 'default',
                      pointerEvents: rule.device_id == 1 ? 'auto' : 'none',
                    }"
                    @click="handleRuleClick(rule)"
                  >
                    <el-card shadow="hover">
                      <div>
                        <strong>{{ rule.name }}</strong>
                      </div>
                      <div>
                        <el-tag type="info">{{ rule.category }}</el-tag>
                      </div>
                      <div>{{ rule.description }}</div>
                      <div>Frequency: {{ rule.max_frequency }}</div>
                      <div style="margin-top: 5px; font-weight: 500">
                        Points: <span class="point">{{ rule.points }}</span>
                      </div>
                    </el-card>
                  </div>
                </el-col>
              </el-row>
            </div>

            <!-- Progress
            <div class="progress-section">
              <el-progress :percentage="progress" :stroke-width="18" />
              <p class="description">12/20 minutes completed</p>
            </div> -->

            <!-- <el-divider /> -->

            <!-- Submission Section -->
            <!-- <div class="submission-section">
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
            </div> -->
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
