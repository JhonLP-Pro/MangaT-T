<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const pages = ref([])
const loading = ref(true)
const mangaId = ref(null)
const currentChapter = ref(null)
const nextChapter = ref(null)
const prevChapter = ref(null)

const fetchChapterInfo = async () => {
  try {
    // Récupérer les informations du chapitre actuel
    const chapterResponse = await axios.get(`https://api.mangadex.org/chapter/${route.params.id}`)
    currentChapter.value = chapterResponse.data.data
    mangaId.value = currentChapter.value.relationships.find(r => r.type === 'manga').id

    // Récupérer la liste des chapitres pour trouver le suivant et le précédent
    const chaptersResponse = await axios.get(`https://api.mangadex.org/manga/${mangaId.value}/feed`, {
      params: {
        translatedLanguage: ['fr', 'en'],
        order: { chapter: 'asc' }
      }
    })

    const chapters = chaptersResponse.data.data
    const currentIndex = chapters.findIndex(c => c.id === route.params.id)

    if (currentIndex > 0) {
      prevChapter.value = chapters[currentIndex - 1]
    } else {
      prevChapter.value = null
    }
    
    if (currentIndex < chapters.length - 1) {
      nextChapter.value = chapters[currentIndex + 1]
    } else {
      nextChapter.value = null
    }
  } catch (error) {
    console.error('Erreur lors du chargement des informations du chapitre:', error)
  }
}

const fetchPages = async () => {
  try {
    loading.value = true
    await fetchChapterInfo()

    const response = await axios.get(`https://api.mangadex.org/at-home/server/${route.params.id}`)
    const baseUrl = response.data.baseUrl
    const chapter = response.data.chapter
    
    pages.value = chapter.data.map((page, index) => ({
      id: index,
      url: `${baseUrl}/data/${chapter.hash}/${page}`
    }))
  } catch (error) {
    console.error('Erreur lors du chargement des pages:', error)
  } finally {
    loading.value = false
  }
}

const goToChapter = (chapterId) => {
  if (chapterId) {
    router.push(`/read/${chapterId}`)
  }
}

// Surveiller les changements de route
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      pages.value = []
      fetchPages()
    }
  }
)

onMounted(fetchPages)
</script>

<template>
  <div class="reader">
    <div class="reader-header">
      <div class="header-content">
        <router-link :to="`/chapters/${mangaId}`" class="back-button">
          ← Retour aux chapitres
        </router-link>
        
        <div class="chapter-navigation">
          <button 
            @click="goToChapter(prevChapter?.id)" 
            class="nav-button"
            :disabled="!prevChapter"
          >
            ← Chapitre précédent
          </button>
          <span class="current-chapter" v-if="currentChapter">
            Chapitre {{ currentChapter.attributes.chapter }}
          </span>
          <button 
            @click="goToChapter(nextChapter?.id)" 
            class="nav-button"
            :disabled="!nextChapter"
          >
            Chapitre suivant →
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading">
      Chargement du chapitre...
    </div>
    
    <div v-else class="pages">
      <img 
        v-for="page in pages" 
        :key="page.id"
        :src="page.url"
        :alt="`Page ${page.id + 1}`"
        class="page-image"
        loading="lazy"
      >
    </div>
  </div>
</template>

<style scoped>
.reader {
  width: 100%;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.reader-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  padding: 15px;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.chapter-navigation {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.back-button {
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: bold;
}

.current-chapter {
  color: var(--text-primary);
  font-weight: bold;
}

.nav-button {
  padding: 8px 16px;
  background-color: var(--text-secondary);
  color: var(--bg-primary);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.nav-button:disabled {
  background-color: var(--border-color);
  cursor: not-allowed;
}

.pages {
  margin-top: 120px;
  width: 100%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.page-image {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 0 auto;
}

.loading {
  margin-top: 120px;
  text-align: center;
  padding: 2rem;
  color: var(--text-primary);
}

@media (max-width: 800px) {
  .pages {
    padding: 0 10px;
  }
}
</style>
