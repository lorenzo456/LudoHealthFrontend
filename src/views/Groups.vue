<script setup lang="ts">
import Navbar from '@/components/Navbar.vue'
import { getPublicGroups, getPlayerGroups, joinGroup } from '@/api/Groups'
import type { Group } from '@/types/Group'
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

const playerId = useAuthStore().player!.id

const publicGroups = ref<Group[]>([])
const memberGroupIds = ref<Set<number>>(new Set())
const loading = ref(true)
const joiningId = ref<number | null>(null)

onMounted(async () => {
  try {
    const [all, mine] = await Promise.all([
      getPublicGroups(),
      getPlayerGroups(playerId),
    ])
    publicGroups.value = all
    memberGroupIds.value = new Set(mine.map((g) => g.id))
  } catch {
    ElMessage.error('Failed to load groups')
  } finally {
    loading.value = false
  }
})

const isMember = (groupId: number) => memberGroupIds.value.has(groupId)

const handleJoin = async (group: Group) => {
  joiningId.value = group.id
  try {
    await joinGroup(group.id, playerId)
    memberGroupIds.value.add(group.id)
    ElMessage.success(`Joined "${group.name}"`)
  } catch {
    ElMessage.error('Failed to join group')
  } finally {
    joiningId.value = null
  }
}
</script>

<template>
  <Navbar />
  <el-container>
    <el-main>
      <div class="page-container">
        <div class="page-header">
          <h1>Discover Groups</h1>
          <p>Find and join public groups to access their challenges</p>
        </div>

        <el-row v-if="loading">
          <el-col :span="24">
            <el-skeleton :rows="4" animated />
          </el-col>
        </el-row>

        <div v-else-if="publicGroups.length" class="group-list">
          <el-card
            v-for="group in publicGroups"
            :key="group.id"
            class="group-card"
            shadow="hover"
          >
            <div class="group-banner">
              <span class="group-initial">{{ group.name.charAt(0).toUpperCase() }}</span>
            </div>
            <div class="group-info">
              <h3>{{ group.name }}</h3>
              <p v-if="group.description" class="group-description">{{ group.description }}</p>
            </div>
            <div class="group-action">
              <el-tag v-if="isMember(group.id)" type="success">Joined</el-tag>
              <el-button
                v-else
                type="primary"
                :loading="joiningId === group.id"
                @click="handleJoin(group)"
              >
                Join
              </el-button>
            </div>
          </el-card>
        </div>

        <el-empty v-else description="No public groups available" />
      </div>
    </el-main>
  </el-container>
</template>

<style scoped>
.page-container {
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

.group-info {
  flex: 1;
  padding: 0 1.2rem;
}

.group-info h3 {
  margin: 0 0 4px 0;
}

.group-description {
  margin: 0;
  font-size: 13px;
  color: #888;
}

.group-action {
  padding-right: 1.2rem;
  flex-shrink: 0;
}
</style>
