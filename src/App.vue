<script setup>
import { ref, watch, onMounted } from 'vue'

const isDarkMode = ref(localStorage.getItem('darkMode') === 'true')

const updateBodyTheme = (darkMode) => {
  document.body.style.backgroundColor = darkMode ? '#1a202c' : '#f5f5f5'
}

watch(isDarkMode, (newValue) => {
  localStorage.setItem('darkMode', newValue)
  updateBodyTheme(newValue)
})

onMounted(() => {
  updateBodyTheme(isDarkMode.value)
})
</script>

<template>
  <div :class="{ 'dark-mode': isDarkMode }" class="app-container">
    <div class="theme-toggle">
      <button @click="isDarkMode = !isDarkMode" class="theme-button">
        {{ isDarkMode ? '☀️' : '🌙' }}
      </button>
    </div>
    <div class="router-view">
      <router-view></router-view>
    </div>
  </div>
</template>

<style>
/* Reset global */
*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --bg-primary: #f5f5f5;
  --bg-secondary: #ffffff;
  --text-primary: #2d3748;
  --text-secondary: #4a5568;
  --border-color: #e2e8f0;
  --hover-color: #edf2f7;
}

.dark-mode {
  --bg-primary: #1a202c;
  --bg-secondary: #2d3748;
  --text-primary: #f7fafc;
  --text-secondary: #e2e8f0;
  --border-color: #4a5568;
  --hover-color: #2d3748;
}

html, body {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

body {
  background-color: var(--bg-primary) !important;
}

#app {
  width: 100%;
  min-height: 100vh;
  background-color: var(--bg-primary);
  display: flex;
  flex-direction: column;
}

.theme-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.theme-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  background-color: var(--bg-secondary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.theme-button:hover {
  transform: scale(1.1);
}

/* Styles globaux pour le mode sombre */
.dark-mode header {
  background-color: var(--bg-secondary);
}

.dark-mode .manga-item,
.dark-mode .chapter-item {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.dark-mode .search-bar input {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border-color: var(--border-color);
}

.dark-mode .tag {
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
}

.dark-mode .nav-button,
.dark-mode .detail-button,
.dark-mode .chapters-button,
.dark-mode .load-more-button {
  background-color: var(--text-secondary);
  color: var(--bg-primary);
}

.dark-mode .back-button {
  color: var(--text-secondary);
}

.dark-mode .chapter-language {
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
}

/* Ajout de styles pour éviter les espaces blancs */
.router-view {
  flex: 1;
  width: 100%;
  background-color: var(--bg-primary);
}

/* Style pour masquer la barre de défilement */
::-webkit-scrollbar {
  width: 0;
  background: transparent;
}

/* Pour Firefox */
* {
  scrollbar-width: none;
}

/* Pour IE et Edge */
* {
  -ms-overflow-style: none;
}
</style>
