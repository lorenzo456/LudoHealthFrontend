<script setup lang="ts">
import Navbar from '@/components/Navbar.vue'
import { reactive, ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import apiClient from '@/api/apiclient'
import { getAllGroups, getGroupChallenges, updateGroup, createGroup } from '@/api/Groups'
import type { Group } from '@/types/Group'
import { useAuthStore } from '@/stores/auth'

const playerId = useAuthStore().player!.id
const activeTab = ref('groups')

// ─── Activity types ───────────────────────────────────────────────
const categories = ['Physical', 'Cognitive', 'Social']
const operators  = ['>=', '>', '<=', '<', '=']

interface ActivityProperty { activity_property_id: number; name: string; unit: string }
interface ActivityType     { id: number; name: string; properties: ActivityProperty[] }
interface TaskProp         { activity_type_id: number | null; activity_property_id: number | null; threshold_value: number | null; operator: string }
interface Task             { name: string; description: string; frequency: number; properties: TaskProp[] }

const activityTypes = ref<ActivityType[]>([])

const propertiesFor = (typeId: number | null) =>
  typeId ? (activityTypes.value.find((t) => t.id === typeId)?.properties ?? []) : []

const onTypeChange = (_task: Task, prop: TaskProp) => {
  prop.activity_property_id = null
  prop.threshold_value = null
}

// ─── Groups tab ───────────────────────────────────────────────────
const groups      = ref<Group[]>([])
const loadingGroups = ref(true)

const groupDialog = reactive<{
  visible: boolean
  mode: 'create' | 'edit'
  saving: boolean
  id: number | null
  name: string
  description: string
  is_public: boolean
}>({ visible: false, mode: 'create', saving: false, id: null, name: '', description: '', is_public: true })

const openCreateGroup = () => {
  Object.assign(groupDialog, { visible: true, mode: 'create', id: null, name: '', description: '', is_public: true })
}

const openEditGroup = (g: Group) => {
  Object.assign(groupDialog, {
    visible: true, mode: 'edit', id: g.id,
    name: g.name, description: g.description ?? '', is_public: !!g.is_public,
  })
}

const saveGroup = async () => {
  if (!groupDialog.name.trim()) { ElMessage.warning('Group name is required'); return }
  groupDialog.saving = true
  try {
    if (groupDialog.mode === 'create') {
      const created = await createGroup({ name: groupDialog.name, description: groupDialog.description, is_public: groupDialog.is_public, created_by: playerId })
      groups.value.push(created)
      ElMessage.success('Group created')
    } else {
      const updated = await updateGroup(groupDialog.id!, {
        name: groupDialog.name, description: groupDialog.description, is_public: groupDialog.is_public ? 1 : 0,
      })
      const idx = groups.value.findIndex((g) => g.id === groupDialog.id)
      if (idx !== -1) groups.value[idx] = updated
      ElMessage.success('Group updated')
    }
    groupDialog.visible = false
  } catch { ElMessage.error('Failed to save group') }
  finally { groupDialog.saving = false }
}

// ─── Challenges tab ───────────────────────────────────────────────
const selectedGroupId = ref<number | null>(null)
const groupChallenges = ref<{ level: number }[]>([])

const existingLevels = computed(() => {
  const lvls = [...new Set(groupChallenges.value.map((c) => c.level))].sort((a, b) => a - b)
  return lvls
})

const challengeForm = reactive({
  name: '', category: '', start_date: '', end_date: '', points: 100, level: 1,
})

const tasks = ref<Task[]>([])
const submitting = ref(false)

const onGroupSelect = async (groupId: number) => {
  selectedGroupId.value = groupId
  challengeForm.level = 1
  try {
    groupChallenges.value = await getGroupChallenges(groupId) as { level: number }[]
    const levels = existingLevels.value
    const maxLevel = levels.length > 0 ? (levels[levels.length - 1] ?? 0) : 0
    challengeForm.level = maxLevel + 1
  } catch { groupChallenges.value = [] }
}

const addTask = () => {
  tasks.value.push({ name: '', description: '', frequency: 1,
    properties: [{ activity_type_id: null, activity_property_id: null, threshold_value: null, operator: '>=' }] })
}
const removeTask = (i: number) => tasks.value.splice(i, 1)

const handleSubmit = async () => {
  if (!selectedGroupId.value) { ElMessage.warning('Please select a group'); return }
  if (!challengeForm.name || !challengeForm.category || !challengeForm.start_date || !challengeForm.end_date) {
    ElMessage.warning('Please fill in all required challenge fields'); return
  }
  for (const t of tasks.value) {
    if (!t.name) { ElMessage.warning('Each task needs a name'); return }
  }

  submitting.value = true
  try {
    await apiClient.post('/challenges', {
      created_by: playerId,
      group_id: selectedGroupId.value,
      level: challengeForm.level,
      name: challengeForm.name,
      category: challengeForm.category,
      start_date: challengeForm.start_date,
      end_date: challengeForm.end_date,
      points: challengeForm.points,
      tasks: tasks.value.map((t) => ({
        name: t.name, description: t.description, frequency: t.frequency,
        properties: t.properties
          .filter((p) => p.activity_property_id !== null)
          .map((p) => ({ activity_property_id: p.activity_property_id, threshold_value: p.threshold_value, operator: p.operator })),
      })),
    })
    ElMessage.success('Challenge created!')
    Object.assign(challengeForm, { name: '', category: '', start_date: '', end_date: '', points: 100 })
    tasks.value = []
    if (selectedGroupId.value) onGroupSelect(selectedGroupId.value)
  } catch { ElMessage.error('Failed to create challenge') }
  finally { submitting.value = false }
}

onMounted(async () => {
  try {
    [activityTypes.value, groups.value] = await Promise.all([
      apiClient.get('/activity-types').then((r) => r.data),
      getAllGroups(),
    ])
  } catch { ElMessage.error('Failed to load data') }
  finally { loadingGroups.value = false }
})
</script>

<template>
  <Navbar />
  <el-container>
    <el-main>
      <div class="page-container">
        <h1 class="page-title">Admin</h1>

        <el-tabs v-model="activeTab" class="main-tabs">

          <!-- ── Groups tab ── -->
          <el-tab-pane label="Groups" name="groups">
            <div class="tab-header">
              <h2 class="tab-title">All Groups</h2>
              <el-button type="primary" @click="openCreateGroup">+ Create Group</el-button>
            </div>

            <el-skeleton v-if="loadingGroups" :rows="3" animated />

            <div v-else-if="groups.length" class="group-list">
              <el-card v-for="g in groups" :key="g.id" class="group-row" shadow="never">
                <div class="group-row-banner" :class="g.is_public ? 'public' : 'private'">
                  {{ g.name.charAt(0).toUpperCase() }}
                </div>
                <div class="group-row-info">
                  <div class="group-row-top">
                    <span class="group-row-name">{{ g.name }}</span>
                    <el-tag :type="g.is_public ? 'success' : 'warning'" size="small">
                      {{ g.is_public ? 'Public' : 'Private' }}
                    </el-tag>
                  </div>
                  <p v-if="g.description" class="group-row-desc">{{ g.description }}</p>
                </div>
                <el-button text type="primary" @click="openEditGroup(g)">Edit</el-button>
              </el-card>
            </div>

            <el-empty v-else description="No groups yet" />
          </el-tab-pane>

          <!-- ── Challenges tab ── -->
          <el-tab-pane label="Create Challenge" name="challenges">
            <el-row :gutter="32">

              <!-- Left: group + level + challenge form -->
              <el-col :xs="24" :md="14">

                <!-- Group & level -->
                <el-card class="section-card">
                  <h3 class="section-heading">Group & Level</h3>
                  <el-form label-position="top">
                    <el-form-item label="Group" required>
                      <el-select
                        v-model="selectedGroupId"
                        placeholder="Select a group"
                        style="width: 100%"
                        @change="onGroupSelect"
                      >
                        <el-option v-for="g in groups" :key="g.id" :label="g.name" :value="g.id" />
                      </el-select>
                    </el-form-item>

                    <el-form-item label="Level" required>
                      <div class="level-row">
                        <div v-if="existingLevels.length" class="level-chips">
                          <span class="level-chips-label">Existing:</span>
                          <el-tag
                            v-for="lvl in existingLevels"
                            :key="lvl"
                            :type="challengeForm.level === lvl ? 'primary' : 'info'"
                            class="level-chip"
                            @click="challengeForm.level = lvl"
                          >
                            Level {{ lvl }}
                          </el-tag>
                        </div>
                        <el-input-number
                          v-model="challengeForm.level"
                          :min="1"
                          style="width: 140px"
                          :disabled="!selectedGroupId"
                        />
                      </div>
                    </el-form-item>
                  </el-form>
                </el-card>

                <!-- Challenge details -->
                <el-card class="section-card">
                  <h3 class="section-heading">Challenge Details</h3>
                  <el-form label-position="top">
                    <el-form-item label="Name" required>
                      <el-input v-model="challengeForm.name" placeholder="e.g. Morning Routine" />
                    </el-form-item>
                    <el-form-item label="Category" required>
                      <el-select v-model="challengeForm.category" placeholder="Select category" style="width: 100%">
                        <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
                      </el-select>
                    </el-form-item>
                    <el-row :gutter="16">
                      <el-col :span="12">
                        <el-form-item label="Start date" required>
                          <el-date-picker v-model="challengeForm.start_date" type="date" format="YYYY-MM-DD" value-format="YYYY-MM-DD" style="width: 100%" />
                        </el-form-item>
                      </el-col>
                      <el-col :span="12">
                        <el-form-item label="End date" required>
                          <el-date-picker v-model="challengeForm.end_date" type="date" format="YYYY-MM-DD" value-format="YYYY-MM-DD" style="width: 100%" />
                        </el-form-item>
                      </el-col>
                    </el-row>
                    <el-form-item label="Points reward">
                      <el-input-number v-model="challengeForm.points" :min="0" :step="10" style="width: 100%" />
                    </el-form-item>
                  </el-form>
                </el-card>
              </el-col>

              <!-- Right: tasks -->
              <el-col :xs="24" :md="10">
                <el-card class="section-card tasks-card">
                  <div class="tasks-header">
                    <h3 class="section-heading" style="margin: 0">Tasks</h3>
                    <el-button type="primary" plain size="small" @click="addTask">+ Add task</el-button>
                  </div>

                  <el-empty v-if="!tasks.length" description="No tasks yet" :image-size="60" />

                  <div v-for="(task, ti) in tasks" :key="ti" class="task-block">
                    <div class="task-block-header">
                      <span class="task-block-label">Task {{ ti + 1 }}</span>
                      <el-button type="danger" text size="small" @click="removeTask(ti)">Remove</el-button>
                    </div>

                    <el-form label-position="top" size="small">
                      <el-form-item label="Name" required>
                        <el-input v-model="task.name" placeholder="e.g. Walk 1000 steps" />
                      </el-form-item>
                      <el-form-item label="Description">
                        <el-input v-model="task.description" placeholder="Optional" />
                      </el-form-item>
                      <el-form-item label="Times per day">
                        <el-input-number v-model="task.frequency" :min="1" style="width: 100%" />
                      </el-form-item>

                      <el-divider content-position="left" style="margin: 8px 0">Condition</el-divider>

                      <div v-for="(prop, pi) in task.properties" :key="pi">
                        <el-form-item label="Activity type">
                          <el-select v-model="prop.activity_type_id" placeholder="Type" style="width: 100%" @change="onTypeChange(task, prop)">
                            <el-option v-for="t in activityTypes" :key="t.id" :label="t.name" :value="t.id" />
                          </el-select>
                        </el-form-item>
                        <el-row :gutter="8">
                          <el-col :span="14">
                            <el-form-item label="Property">
                              <el-select v-model="prop.activity_property_id" placeholder="Property" style="width: 100%" :disabled="!prop.activity_type_id">
                                <el-option v-for="p in propertiesFor(prop.activity_type_id)" :key="p.activity_property_id" :label="`${p.name} (${p.unit})`" :value="p.activity_property_id" />
                              </el-select>
                            </el-form-item>
                          </el-col>
                          <el-col :span="10">
                            <el-form-item label="Operator">
                              <el-select v-model="prop.operator" style="width: 100%">
                                <el-option v-for="op in operators" :key="op" :label="op" :value="op" />
                              </el-select>
                            </el-form-item>
                          </el-col>
                        </el-row>
                        <el-form-item label="Threshold">
                          <el-input-number v-model="prop.threshold_value" :min="0" style="width: 100%" :disabled="!prop.activity_property_id" />
                        </el-form-item>
                      </div>
                    </el-form>
                  </div>
                </el-card>
              </el-col>
            </el-row>

            <el-button
              type="primary"
              size="large"
              :loading="submitting"
              :disabled="!selectedGroupId"
              style="width: 100%; margin-top: 24px"
              @click="handleSubmit"
            >
              Create Challenge
            </el-button>
          </el-tab-pane>

        </el-tabs>
      </div>
    </el-main>
  </el-container>

  <!-- Group dialog -->
  <el-dialog v-model="groupDialog.visible" :title="groupDialog.mode === 'create' ? 'Create Group' : 'Edit Group'" width="480px" :close-on-click-modal="false">
    <el-form label-position="top">
      <el-form-item label="Name" required>
        <el-input v-model="groupDialog.name" placeholder="Group name" />
      </el-form-item>
      <el-form-item label="Description">
        <el-input v-model="groupDialog.description" type="textarea" :rows="3" placeholder="What is this group about?" />
      </el-form-item>
      <el-form-item label="Visibility">
        <el-switch v-model="groupDialog.is_public" active-text="Public" inactive-text="Private" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="groupDialog.visible = false">Cancel</el-button>
      <el-button type="primary" :loading="groupDialog.saving" @click="saveGroup">
        {{ groupDialog.mode === 'create' ? 'Create' : 'Save' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.page-container {
  padding: 32px 0 60px;
  max-width: 1100px;
  margin: 0 auto;
}

.page-title {
  margin: 0 0 24px 0;
  font-size: 28px;
}

.main-tabs {
  --el-tabs-header-height: 44px;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.tab-title {
  margin: 0;
  font-size: 20px;
}

.group-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.group-row :deep(.el-card__body) {
  display: flex;
  align-items: center;
  padding: 0;
  gap: 0;
}

.group-row-banner {
  width: 56px;
  min-height: 64px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: bold;
  color: white;
  border-radius: 4px 0 0 4px;
}

.group-row-banner.public  { background: linear-gradient(135deg, #409eff, #67c23a); }
.group-row-banner.private { background: linear-gradient(135deg, #909399, #606266); }

.group-row-info {
  flex: 1;
  padding: 12px 16px;
}

.group-row-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.group-row-name {
  font-weight: 600;
  font-size: 15px;
}

.group-row-desc {
  margin: 0;
  font-size: 13px;
  color: #888;
}

.section-card {
  margin-bottom: 20px;
}

.section-heading {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #303133;
}

.level-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.level-chips {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.level-chips-label {
  font-size: 13px;
  color: #888;
}

.level-chip {
  cursor: pointer;
}

.tasks-card {
  position: sticky;
  top: 80px;
}

.tasks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.task-block {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.task-block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.task-block-label {
  font-weight: 600;
  color: #409eff;
  font-size: 13px;
}
</style>
