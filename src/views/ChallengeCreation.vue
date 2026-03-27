<script setup lang="ts">
import Navbar from '@/components/Navbar.vue'
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '@/api/apiclient'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const playerId = useAuthStore().player!.id
const submitting = ref(false)
const categories = ['Physical', 'Cognitive', 'Social']
const operators = ['>=', '>', '<=', '<', '=']

interface ActivityProperty {
  activity_property_id: number
  name: string
  unit: string
}
interface ActivityType {
  id: number
  name: string
  properties: ActivityProperty[]
}
interface TaskProperty {
  activity_type_id: number | null
  activity_property_id: number | null
  threshold_value: number | null
  operator: string
}
interface Task {
  name: string
  description: string
  frequency: number
  properties: TaskProperty[]
}

const activityTypes = ref<ActivityType[]>([])

const form = reactive({
  name: '',
  category: '',
  start_date: '',
  end_date: '',
  points: 0,
})

const tasks = ref<Task[]>([])

const addTask = () => {
  tasks.value.push({
    name: '',
    description: '',
    frequency: 1,
    properties: [{ activity_type_id: null, activity_property_id: null, threshold_value: null, operator: '>=' }],
  })
}

const removeTask = (index: number) => {
  tasks.value.splice(index, 1)
}

const propertiesFor = (typeId: number | null): ActivityProperty[] => {
  if (!typeId) return []
  return activityTypes.value.find((t) => t.id === typeId)?.properties ?? []
}

const onTypeChange = (task: Task, prop: TaskProperty) => {
  prop.activity_property_id = null
  prop.threshold_value = null
}

const handleSubmit = async () => {
  if (!form.name || !form.category || !form.start_date || !form.end_date) {
    ElMessage.warning('Please fill in all required challenge fields')
    return
  }

  for (const task of tasks.value) {
    if (!task.name) {
      ElMessage.warning('Each task needs a name')
      return
    }
  }

  submitting.value = true
  try {
    await apiClient.post('/challenges', {
      player_id: playerId,
      ...form,
      tasks: tasks.value.map((t) => ({
        name: t.name,
        description: t.description,
        frequency: t.frequency,
        properties: t.properties
          .filter((p) => p.activity_property_id !== null)
          .map((p) => ({
            activity_property_id: p.activity_property_id,
            threshold_value: p.threshold_value,
            operator: p.operator,
          })),
      })),
    })
    ElMessage.success('Challenge created!')
    router.push('/challenges')
  } catch {
    ElMessage.error('Failed to create challenge')
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  try {
    const response = await apiClient.get('/activity-types')
    activityTypes.value = response.data
  } catch {
    ElMessage.error('Failed to load activity types')
  }
})
</script>

<template>
  <Navbar />
  <el-container>
    <el-main>
      <el-row justify="center" style="margin-top: 40px; margin-bottom: 40px">
        <el-col :xs="22" :sm="18" :md="12">

          <!-- Challenge details -->
          <el-card class="form-card">
            <h2 class="form-title">Create Challenge</h2>
            <el-divider />

            <el-form label-position="top">
              <el-form-item label="Challenge name" required>
                <el-input v-model="form.name" placeholder="e.g. Morning Routine" />
              </el-form-item>

              <el-form-item label="Category" required>
                <el-select v-model="form.category" placeholder="Select a category" style="width: 100%">
                  <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
                </el-select>
              </el-form-item>

              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item label="Start date" required>
                    <el-date-picker
                      v-model="form.start_date"
                      type="date"
                      placeholder="Start date"
                      format="YYYY-MM-DD"
                      value-format="YYYY-MM-DD"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="End date" required>
                    <el-date-picker
                      v-model="form.end_date"
                      type="date"
                      placeholder="End date"
                      format="YYYY-MM-DD"
                      value-format="YYYY-MM-DD"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="Points reward">
                <el-input-number v-model="form.points" :min="0" :step="10" style="width: 100%" />
              </el-form-item>
            </el-form>
          </el-card>

          <!-- Tasks -->
          <div class="tasks-header">
            <h3 class="tasks-title">Tasks</h3>
            <el-button type="primary" plain size="small" @click="addTask">+ Add task</el-button>
          </div>

          <div v-for="(task, taskIndex) in tasks" :key="taskIndex">
            <el-card class="task-card">
              <div class="task-card-header">
                <span class="task-number">Task {{ taskIndex + 1 }}</span>
                <el-button type="danger" text size="small" @click="removeTask(taskIndex)">Remove</el-button>
              </div>

              <el-form label-position="top">
                <el-form-item label="Task name" required>
                  <el-input v-model="task.name" placeholder="e.g. Walk 1000 steps" />
                </el-form-item>

                <el-form-item label="Description">
                  <el-input v-model="task.description" placeholder="Optional description" />
                </el-form-item>

                <el-form-item label="Frequency (times per day)">
                  <el-input-number v-model="task.frequency" :min="1" style="width: 100%" />
                </el-form-item>

                <el-divider content-position="left">Condition</el-divider>

                <div v-for="(prop, propIndex) in task.properties" :key="propIndex">
                  <el-row :gutter="12" align="middle">
                    <el-col :span="7">
                      <el-form-item label="Activity type">
                        <el-select
                          v-model="prop.activity_type_id"
                          placeholder="Type"
                          style="width: 100%"
                          @change="onTypeChange(task, prop)"
                        >
                          <el-option
                            v-for="t in activityTypes"
                            :key="t.id"
                            :label="t.name"
                            :value="t.id"
                          />
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col :span="7">
                      <el-form-item label="Property">
                        <el-select
                          v-model="prop.activity_property_id"
                          placeholder="Property"
                          style="width: 100%"
                          :disabled="!prop.activity_type_id"
                        >
                          <el-option
                            v-for="p in propertiesFor(prop.activity_type_id)"
                            :key="p.activity_property_id"
                            :label="`${p.name} (${p.unit})`"
                            :value="p.activity_property_id"
                          />
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col :span="4">
                      <el-form-item label="Operator">
                        <el-select v-model="prop.operator" style="width: 100%">
                          <el-option v-for="op in operators" :key="op" :label="op" :value="op" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col :span="6">
                      <el-form-item label="Threshold">
                        <el-input-number
                          v-model="prop.threshold_value"
                          :min="0"
                          style="width: 100%"
                          :disabled="!prop.activity_property_id"
                        />
                      </el-form-item>
                    </el-col>
                  </el-row>
                </div>
              </el-form>
            </el-card>
          </div>

          <el-empty v-if="tasks.length === 0" description="No tasks yet — add one above" :image-size="80" />

          <!-- Submit -->
          <el-button
            type="primary"
            size="large"
            :loading="submitting"
            style="width: 100%; margin-top: 24px"
            @click="handleSubmit"
          >
            Create Challenge & Tasks
          </el-button>

        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>

<style scoped>
.form-card {
  padding: 24px;
}

.form-title {
  margin: 0;
  font-size: 22px;
  color: #303133;
}

.tasks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 28px 0 12px;
}

.tasks-title {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.task-card {
  margin-bottom: 16px;
  padding: 8px;
}

.task-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.task-number {
  font-weight: 600;
  color: #409eff;
}
</style>
