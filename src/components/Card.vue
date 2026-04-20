<template>
  <router-link :to="`/challenge/${id}`" class="card-link">
    <el-card class="my-card">
      <div class="image-container">
        <img src="https://picsum.photos/400/200" alt="Sample Image" />
      </div>
      <div class="card-content">
        <div class="card-title-row">
          <h3>{{ title }}</h3>
          <span v-if="points !== undefined" class="points-badge">{{ points }} pts</span>
        </div>
        <p>{{ description }}</p>
        <div class="progress-section">
          <div class="progress-label">
            <span>Progress</span>
            <span>{{ completedTasks }} / {{ totalTasks }} tasks</span>
          </div>
          <el-progress
            :percentage="(totalTasks ?? 0) > 0 ? Math.round(((completedTasks ?? 0) / (totalTasks ?? 1)) * 100) : 0"
            :stroke-width="8"
            :show-text="false"
            :color="(completedTasks ?? 0) === (totalTasks ?? 0) && (totalTasks ?? 0) > 0 ? '#67c23a' : '#409eff'"
          />
        </div>
      </div>
    </el-card>
  </router-link>
</template>

<script setup lang="ts">
defineProps<{
  id: number
  title?: string
  description?: string
  completedTasks?: number
  totalTasks?: number
  points?: number
}>()
</script>

<style scoped>
.my-card {
  width: 300px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.card-link {
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  display: block;
}
.image-container {
  width: 100%;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-content {
  padding: 1rem;
  text-align: center;
}

.card-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.card-title-row h3 {
  margin: 0;
}

.points-badge {
  font-size: 12px;
  font-weight: 600;
  color: #67c23a;
  background: #f0f9eb;
  border: 1px solid #b3e19d;
  border-radius: 20px;
  padding: 2px 10px;
  white-space: nowrap;
}

.card-content p {
  margin: 0 0 1rem 0;
  color: #555;
  font-size: 0.95rem;
}

.progress-section {
  text-align: left;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #888;
  margin-bottom: 6px;
}
</style>
