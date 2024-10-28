<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const chapters = ref([])
const loading = ref(true)
const manga = ref(null)
const offset = ref(0)
const hasMore = ref(true)
const loadingMore = ref(false)
const selectedLanguage = ref('all')
const chapterSearch = ref('')

// Nouvelle fonction pour regrouper les chapitres
const groupChapters = (chaptersList) => {
  const groupedMap = new Map()

  chaptersList.forEach(chapter => {
    const chapterNum = chapter.attributes.chapter
    if (!chapterNum) return // Ignorer les chapitres sans numéro

    if (!groupedMap.has(chapterNum)) {
      groupedMap.set(chapterNum, {
        ...chapter,
        parts: [chapter],
        totalPages: chapter.attributes.pages || 0
      })
    } else {
      const existing = groupedMap.get(chapterNum)
      existing.parts.push(chapter)
      existing.totalPages += chapter.attributes.pages || 0
      // Garder l'ID du premier chapitre pour la navigation
      if (parseFloat(chapter.attributes.chapter) === parseFloat(existing.attributes.chapter)) {
        if ((chapter.attributes.pages || 0) > (existing.parts[0].attributes.pages || 0)) {
          // Si la nouvelle partie a plus de pages, la mettre en premier
          existing.parts.unshift(chapter)
        }
      }
    }
  })

  return Array.from(groupedMap.values())
}

const filteredChapters = computed(() => {
  let filtered = chapters.value

  // Filtre par langue
  if (selectedLanguage.value !== 'all') {
    filtered = filtered.filter(chapter => 
      chapter.attributes.translatedLanguage === selectedLanguage.value
    )
  }

  // Filtre par numéro de chapitre
  if (chapterSearch.value) {
    filtered = filtered.filter(chapter => {
      const chapterNum = chapter.attributes.chapter
      return chapterNum && chapterNum.startsWith(chapterSearch.value)
    })
  }

  // Grouper les chapitres
  return groupChapters(filtered)
})

const fetchChapters = async (isLoadingMore = false) => {
  if (isLoadingMore) {
    loadingMore.value = true
  } else {
    loading.value = true
  }

  try {
    if (!isLoadingMore) {
      // Récupérer les informations du manga seulement la première fois
      const mangaResponse = await axios.get(`https://api.mangadex.org/manga/${route.params.id}`)
      manga.value = mangaResponse.data.data
    }

    // Récupérer les chapitres avec pagination
    const response = await axios.get(`https://api.mangadex.org/manga/${route.params.id}/feed`, {
      params: {
        limit: 100,
        offset: offset.value,
        translatedLanguage: ['fr', 'en'],
        order: {
          chapter: 'desc'
        },
        includes: ['scanlation_group'],
        // Supprimé contentRating et autres filtres qui pourraient bloquer des chapitres
      }
    })
    
    const newChapters = response.data.data

    if (isLoadingMore) {
      chapters.value = [...chapters.value, ...newChapters]
    } else {
      chapters.value = newChapters
    }

    // Vérifier s'il y a plus de chapitres à charger
    hasMore.value = response.data.total > chapters.value.length
    offset.value += response.data.data.length

  } catch (error) {
    console.error('Erreur lors du chargement des chapitres:', error)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

// Modification de la fonction goToChapter pour gérer les parties multiples
const goToChapter = (chapter) => {
  if (chapter.parts && chapter.parts.length > 0) {
    // Commencer par la première partie
    router.push(`/read/${chapter.parts[0].id}`)
  }
}

const formatChapterNumber = (number) => {
  return number ? `Chapitre ${number}` : 'Chapitre non numéroté'
}

const validateNumberInput = (event) => {
  // Permet seulement les chiffres et le point
  if (!/[\d.]/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Delete') {
    event.preventDefault()
  }
}

onMounted(fetchChapters)
</script>

<template>
  <div class="chapter-list">
    <div class="header">
      <router-link to="/" class="back-button">← Accueil</router-link>
      <router-link :to="`/manga/${route.params.id}`" class="back-button">← Retour au manga</router-link>
    </div>

    <div v-if="loading && !chapters.length" class="loading">
      Chargement des chapitres...
    </div>
    
    <div v-else>
      <h1>{{ manga?.attributes?.title?.en || manga?.attributes?.title?.ja }}</h1>
      
      <div class="filters">
        <!-- Sélecteur de langue -->
        <div class="language-filter">
          <select v-model="selectedLanguage" class="language-select">
            <option value="all">Toutes les langues</option>
            <option value="fr">Français</option>
            <option value="en">Anglais</option>
          </select>
        </div>

        <!-- Barre de recherche par numéro -->
        <div class="chapter-search">
          <input
            v-model="chapterSearch"
            @keypress="validateNumberInput"
            type="text"
            placeholder="Rechercher un chapitre (ex: 12)"
            class="chapter-search-input"
          >
        </div>
      </div>
      
      <div v-if="filteredChapters.length === 0" class="no-chapters">
        Aucun chapitre disponible dans cette langue
      </div>
      
      <div v-else>
        <div class="chapters">
          <div 
            v-for="chapter in filteredChapters" 
            :key="chapter.id"
            class="chapter-item"
            @click="goToChapter(chapter)"
          >
            <div class="chapter-info">
              <span class="chapter-number">
                {{ formatChapterNumber(chapter.attributes.chapter) }}
              </span>
              <span class="chapter-title">
                {{ chapter.attributes.title || 'Sans titre' }}
              </span>
              <span v-if="chapter.parts && chapter.parts.length > 1" class="parts-info">
                ({{ chapter.parts.length }} parties)
              </span>
            </div>
            <div class="chapter-meta">
              <span class="chapter-language">
                {{ chapter.attributes.translatedLanguage.toUpperCase() }}
              </span>
              <span class="chapter-pages">
                {{ chapter.totalPages || chapter.attributes.pages }} pages
              </span>
            </div>
          </div>
        </div>

        <div class="load-more" v-if="hasMore">
          <button 
            @click="loadMoreChapters" 
            :disabled="loadingMore"
            class="load-more-button"
          >
            {{ loadingMore ? 'Chargement...' : 'Charger plus de chapitres' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chapter-list {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  width: 100vw;
}

.header {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.back-button {
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: bold;
}

h1 {
  margin-bottom: 20px;
  color: var(--text-primary);
}

.chapters {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chapter-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chapter-item:hover {
  transform: translateX(5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.chapter-info {
  display: flex;
  gap: 10px;
  align-items: center;
}

.chapter-number {
  font-weight: bold;
  color: var(--text-primary);
}

.chapter-title {
  color: var(--text-secondary);
}

.chapter-meta {
  display: flex;
  gap: 10px;
  align-items: center;
}

.chapter-language {
  background-color: var(--bg-primary);
  color: var(--text-secondary);
}

.chapter-pages {
  color: var(--text-secondary);
}

.loading {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #4a5568;
}

.no-chapters {
  text-align: center;
  padding: 2rem;
  color: #718096;
  font-size: 1.1rem;
}

.load-more {
  text-align: center;
  margin-top: 20px;
  padding: 20px;
}

.load-more-button {
  padding: 12px 24px;
  background-color: var(--text-secondary);
  color: var(--bg-primary);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;
}

.load-more-button:hover:not(:disabled) {
  background-color: #2d3748;
}

.load-more-button:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
}

.language-filter {
  margin: 20px 0;
  display: flex;
  justify-content: center;
}

.language-select {
  padding: 8px 16px;
  font-size: 16px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
}

.language-select:focus {
  outline: none;
  border-color: var(--text-secondary);
  box-shadow: 0 0 0 3px rgba(74, 85, 104, 0.2);
}

.filters {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin: 20px 0;
  flex-wrap: wrap;
}

.chapter-search {
  flex: 1;
  max-width: 300px;
}

.chapter-search-input {
  width: 100%;
  padding: 8px 16px;
  font-size: 16px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  transition: all 0.2s;
}

.chapter-search-input:focus {
  outline: none;
  border-color: var(--text-secondary);
  box-shadow: 0 0 0 3px rgba(74, 85, 104, 0.2);
}

.chapter-search-input::placeholder {
  color: var(--text-secondary);
}

.language-filter {
  flex: 0 0 auto;
}

@media (max-width: 640px) {
  .filters {
    flex-direction: column;
    gap: 10px;
  }

  .chapter-search {
    max-width: 100%;
  }
}

.parts-info {
  font-size: 0.9em;
  color: var(--text-secondary);
  margin-left: 10px;
}
</style>
