<script setup lang="ts">
import Navbar from '@/components/Navbar.vue'
import { getPlayer } from '@/api/Player'
import type { Player } from '@/types/Player'
import { ref, onMounted } from 'vue'

const player = ref<Player | null>(null)

onMounted(async () => {
  try {
    player.value = await getPlayer(1)
  } catch (error) {
    console.error('Error fetching profile:', error)
  }
})
</script>

<template>
  <Navbar />
  <el-container>
    <el-main>
      <el-row justify="center" style="margin-top: 40px">
        <el-col :xs="20" :sm="14" :md="8">
          <el-card v-if="player" class="profile-card">
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
    </el-main>
  </el-container>
</template>

<style scoped>
.profile-card {
  padding: 32px 16px;
}

.profile-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
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
</style>
