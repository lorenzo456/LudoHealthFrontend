<script setup lang="ts">
// No props needed — all content is hardcoded for now
import { Activity } from '@/types/Activity'
defineProps<{
  activity: Activity
}>()
</script>

<template>
  <div class="activity-card">
    <!-- Image at the top -->
    <img src="https://picsum.photos/300/180" alt="Activity" class="activity-image" />

    <!-- Content -->
    <div class="activity-content">
      <!-- Header: User + Date -->
      <div class="activity-header">
        <span class="user-name">Alice</span>
        <span class="activity-date">{{ activity.created_at }}</span>
      </div>

      <!-- Activity text -->
      <p class="activity-text">
        {{ activity.activity_type_name }} {{ activity.value }} {{ activity.unit }}
      </p>

      <!-- Footer: Points and Likes -->
      <!-- <div class="activity-footer">
        <span class="points">+10 pts</span>
        <span class="likes">❤️ 5</span>
      </div> -->
    </div>
  </div>
</template>

<style scoped>
.activity-card {
  width: 400px;
  border: 1px solid #ccc;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

.activity-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.activity-content {
  padding: 12px;
  display: flex;
  flex-direction: column;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.user-name {
  font-weight: bold;
  color: #333;
}

.activity-text {
  font-size: 14px;
  margin-bottom: 12px;
  color: #444;
}

.activity-footer {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #555;
}

.points {
  font-weight: bold;
  color: #2b8a3e; /* green for positive points */
}

.likes {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
