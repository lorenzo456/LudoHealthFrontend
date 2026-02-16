<template>
  <el-card class="my-card">
    <div class="image-container">
      <img src="https://picsum.photos/400/200" alt="Sample Image" />
    </div>
    <div class="card-content">
      <h3>{{title}}</h3>
      <p>{{description}}</p>
    </div>
  </el-card>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
  description?: string
}>()
</script>

<style scoped>
.my-card {
  width: 300px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
  object-fit: cover; /* ensures no distortion, crops nicely */
}

.card-content {
  padding: 1rem;
  text-align: center;
}

.card-content h3 {
  margin: 0 0 0.5rem 0;
}

.card-content p {
  margin: 0;
  color: #555;
  font-size: 0.95rem;
}
</style>
