<script setup lang="ts">
import type { Activity } from '@/types/Activity'
import { useAuthStore } from '@/stores/auth'

defineProps<{
  activity: Activity
}>()

const player = useAuthStore().player
</script>

<template>
  <div class="activity-card">
    <!-- Image at the top -->
    <img src="https://picsum.photos/300/180" alt="Activity" class="activity-image" />

    <!-- Content -->
    <div class="activity-content">
      <!-- Header: User + Date + Source -->
      <div class="activity-header">
        <span class="user-name">{{ player?.first_name }} {{ player?.last_name }}</span>
        <div class="header-right">
          <span class="activity-date">{{ activity.created_at }}</span>
          <el-tooltip :content="activity.source === 'google_fit' ? 'Google Fit' : 'LudoHealth'" placement="top">
            <span class="source-badge">
              <!-- Google Fit -->
              <svg v-if="activity.source === 'google_fit'" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" class="source-icon">
                <defs>
                  <linearGradient id="gf-grad-card" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#4285F4"/>
                    <stop offset="100%" stop-color="#34A853"/>
                  </linearGradient>
                </defs>
                <rect width="48" height="48" rx="12" fill="url(#gf-grad-card)"/>
                <path d="M24 34s-11-7.5-11-14a7 7 0 0 1 11-5.74A7 7 0 0 1 35 20c0 6.5-11 14-11 14z" fill="#fff"/>
              </svg>
              <!-- LudoHealth -->
              <svg v-else viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" class="source-icon">
                <rect width="48" height="48" rx="12" fill="#67c23a"/>
                <text x="24" y="33" text-anchor="middle" font-size="26" font-weight="bold" font-family="sans-serif" fill="#fff">L</text>
              </svg>
            </span>
          </el-tooltip>
        </div>
      </div>

      <!-- Activity text -->
      <p class="activity-text">{{ activity.activity_type_name }}</p>
      <div v-if="activity.properties.length" class="activity-properties">
        <div v-for="prop in activity.properties" :key="prop.name" class="activity-property">
          <span class="property-name">{{ prop.name }}</span>
          <span class="property-value">{{ prop.value }} {{ prop.unit }}</span>
        </div>
      </div>
      <p v-else class="no-properties">No details recorded</p>

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
  align-items: center;
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.source-badge {
  display: flex;
  align-items: center;
}

.source-icon {
  width: 20px;
  height: 20px;
  border-radius: 5px;
}

.user-name {
  font-weight: bold;
  color: #333;
}

.activity-text {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 6px;
  color: #444;
}

.activity-property {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #555;
  margin-bottom: 4px;
}

.activity-properties {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.no-properties {
  font-size: 12px;
  color: #bbb;
  margin: 0;
  font-style: italic;
}

.property-name {
  text-transform: capitalize;
  color: #888;
}

.property-value {
  font-weight: 500;
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
