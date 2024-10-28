<script setup>
import { ref } from 'vue'
import { useDebounce } from '@vueuse/core'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchQuery = ref('')
const mangas = ref([])
const loading = ref(false)
const showNSFW = ref(false)

const searchMangas = useDebounce(async () => {
  if (!searchQuery.value) return
  
  loading.value = true
  try {
    const response = await axios.get('https://api.mangadex.org/manga', {
      params: {
        limit: 20,
        title: searchQuery.value,
        includes: ['cover_art'],
        contentRating: showNSFW.value 
          ? ['safe', 'suggestive', 'erotica', 'pornographic']
          : ['safe', 'suggestive'],
        order: {
          relevance: 'desc'
        },
        includedTagsMode: 'OR',
        excludedTagsMode: 'OR',
        hasAvailableChapters: true,
        availableTranslatedLanguage: ['en', 'fr']
      }
    })
    mangas.value = response.data.data
  } catch (error) {
    console.error('Erreur lors de la recherche:', error)
  } finally {
    loading.value = false
  }
}, 500)

const getCoverImage = (manga) => {
  const coverArt = manga.relationships.find(r => r.type === 'cover_art')
  if (!coverArt) return ''
  const fileName = coverArt.attributes?.fileName
  if (!fileName) return ''
  return `https://uploads.mangadex.org/covers/${manga.id}/${fileName}.256.jpg`
}

const goToMangaDetail = (mangaId) => {
  router.push(`/manga/${mangaId}`)
}
</script>

<template>
  <div class="header">
    <h1>MangaT-T</h1>
    <div class="search-container">
      <div class="search-bar">
        <input 
          v-model="searchQuery" 
          @input="searchMangas"
          type="text" 
          placeholder="Rechercher un manga..."
        >
      </div>
      <div class="toggle-container">
        <label class="toggle">
          <input 
            type="checkbox" 
            v-model="showNSFW"
            @change="searchMangas"
          >
          <span class="toggle-slider"></span>
          <span class="toggle-label">H</span>
        </label>
      </div>
    </div>
  </div>


  <div v-if="loading" class="loading">
    Chargement...
  </div>
  
  <div v-else class="manga-list">
    <div 
      v-for="manga in mangas" 
      :key="manga.id" 
      class="manga-item"
      @click="goToMangaDetail(manga.id)"
    >
      <div class="manga-info">
        <h3>{{ manga.attributes.title.en || manga.attributes.title.ja }}</h3>
        <div class="tags">
          <span v-for="tag in manga.attributes.tags.slice(0, 3)" :key="tag.id" class="tag">
            {{ tag.attributes.name.en }}
          </span>
        </div>
        <button class="detail-button">Voir les détails</button>
      </div>
      <div class="manga-image">
        <img 
          v-if="manga.relationships?.find(r => r.type === 'cover_art')"
          :src="getCoverImage(manga)"
          :alt="manga.attributes.title.en || manga.attributes.title.ja"
        >
      </div>
    </div>
  </div>

</template>

<style scoped>

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: var(--bg-secondary);
  padding: 20px 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
  color: var(--text-primary);
}

.search-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  max-width: 700px;
  margin: 0 auto;
  padding: 0 20px;
}

.search-bar {
  flex: 1;
}

.search-bar input {
  width: 100%;
  padding: 12px 20px;
  font-size: 16px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  transition: all 0.2s;
}

.search-bar input:focus {
  outline: none;
  border-color: var(--text-secondary);
  box-shadow: 0 0 0 3px rgba(74, 85, 104, 0.2);
}

.search-bar input::placeholder {
  color: var(--text-secondary);
}

.toggle-container {
  display: flex;
  align-items: center;
}

.toggle {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
  cursor: pointer;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--border-color);
  border-radius: 34px;
  transition: .4s;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: var(--bg-secondary);
  border-radius: 50%;
  transition: .4s;
}

.toggle-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--text-primary);
  font-weight: bold;
  font-size: 14px;
  z-index: 1;
}

input:checked + .toggle-slider {
  background-color: #ff69b4;
}

input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

.manga-list {
  margin-top: 160px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  background-color: var(--bg-primary);
  width: 100vw;
  min-height: calc(100vh - 160px);
  position: relative;
  left: 50%;
  transform: translateX(-50%);
}

.manga-item {
  display: flex;
  background-color: var(--bg-secondary);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  height: 200px;
}

.manga-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.manga-info {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.manga-info h3 {
  font-size: 1.2rem;
  margin-bottom: 10px;
  color: var(--text-primary);
}

.tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  background-color: var(--bg-primary);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
  color: var(--text-secondary);
}

.manga-image {
  width: 140px;
  flex-shrink: 0;
}

.manga-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-button {
  align-self: flex-start;
  padding: 8px 16px;
  background-color: var(--text-secondary);
  color: var(--bg-primary);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 14px;
}

.detail-button:hover {
  background-color: var(--text-primary);
}

.loading {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: var(--text-primary);
  margin-top: 160px;
  width: 100vw;
  min-height: calc(100vh - 160px);
  background-color: var(--bg-primary);
  position: relative;
  left: 50%;
  transform: translateX(-50%);
}

@media (max-width: 640px) {
  .manga-item {
    flex-direction: column;
    height: auto;
  }

  .manga-image {
    width: 100%;
    height: 200px;
    order: -1;
  }

  .manga-info {
    padding: 15px;
  }
}
</style>
