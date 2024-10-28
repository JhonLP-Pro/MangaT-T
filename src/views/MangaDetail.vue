<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const manga = ref(null)
const loading = ref(true)
const firstChapter = ref(null)
const lastChapter = ref(null)

const fetchMangaDetails = async () => {
  try {
    const response = await axios.get(`https://api.mangadex.org/manga/${route.params.id}`, {
      params: {
        includes: ['cover_art', 'author', 'artist']
      }
    })
    manga.value = response.data.data

    // Récupérer les chapitres
    const chaptersResponse = await axios.get(`https://api.mangadex.org/manga/${route.params.id}/feed`, {
      params: {
        translatedLanguage: ['fr', 'en'],
        order: { chapter: 'asc' },
        limit: 1
      }
    })
    firstChapter.value = chaptersResponse.data.data[0]

    // Récupérer le dernier chapitre
    const lastChapterResponse = await axios.get(`https://api.mangadex.org/manga/${route.params.id}/feed`, {
      params: {
        translatedLanguage: ['fr', 'en'],
        order: { chapter: 'desc' },
        limit: 1
      }
    })
    lastChapter.value = lastChapterResponse.data.data[0]

  } catch (error) {
    console.error('Erreur lors du chargement du manga:', error)
  } finally {
    loading.value = false
  }
}

const goToChapter = (chapterId) => {
  if (chapterId) {
    router.push(`/read/${chapterId}`)
  }
}

const getCoverImage = (manga) => {
  const coverArt = manga.relationships.find(r => r.type === 'cover_art')
  if (!coverArt || !coverArt.attributes?.fileName) return ''
  return `https://uploads.mangadex.org/covers/${manga.id}/${coverArt.attributes.fileName}.512.jpg`
}

onMounted(fetchMangaDetails)
</script>

<template>
  <div class="manga-detail">
    <div v-if="loading" class="loading">
      Chargement...
    </div>
    
    <div v-else-if="manga" class="manga-content">
      <router-link to="/" class="back-button">← Retour</router-link>
      
      <div class="manga-header">
        <img 
          v-if="manga.relationships?.find(r => r.type === 'cover_art')"
          :src="getCoverImage(manga)"
          :alt="manga.attributes.title.en || manga.attributes.title.ja"
          class="cover-image"
        >
        
        <div class="manga-info">
          <h1>{{ manga.attributes.title.en || manga.attributes.title.ja }}</h1>
          
          <div class="metadata">
            <p><strong>Statut:</strong> {{ manga.attributes.status }}</p>
            <p><strong>Année de publication:</strong> {{ manga.attributes.year || 'Non spécifié' }}</p>
            <p><strong>Auteur:</strong> 
              {{ manga.relationships.find(r => r.type === 'author')?.attributes?.name || 'Non spécifié' }}
            </p>
          </div>
          
          <div class="description" v-if="manga.attributes.description.en">
            <h3>Description</h3>
            <p>{{ manga.attributes.description.en }}</p>
          </div>
          
          <div class="tags">
            <span v-for="tag in manga.attributes.tags" :key="tag.id" class="tag">
              {{ tag.attributes.name.en }}
            </span>
          </div>
          
          <div class="actions">
            <div class="reading-buttons">
              <button 
                v-if="firstChapter"
                @click="goToChapter(firstChapter.id)" 
                class="reading-button"
              >
                Commencer la lecture
              </button>
              <button 
                v-if="lastChapter && lastChapter.id !== firstChapter?.id"
                @click="goToChapter(lastChapter.id)" 
                class="reading-button"
              >
                Dernier chapitre
              </button>
            </div>
            <button 
              @click="router.push(`/chapters/${route.params.id}`)" 
              class="chapters-button"
            >
              Voir tous les chapitres
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.manga-detail {
  max-width: 1200px;
  margin: 40px auto;
  padding: 20px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  width: 86vw;
}

.back-button {
  display: inline-block;
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: bold;
  margin-bottom: 30px;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s;
}

.back-button:hover {
  background-color: var(--bg-secondary);
  transform: translateX(-5px);
}

.manga-header {
  display: grid;
  grid-template-columns: minmax(250px, 300px) 1fr;
  gap: 40px;
  background-color: var(--bg-secondary);
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.cover-image {
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s;
}

.cover-image:hover {
  transform: scale(1.02);
}

.manga-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.manga-info h1 {
  font-size: 2rem;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.3;
}

.metadata {
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: var(--text-secondary);
  background-color: var(--bg-primary);
  padding: 15px;
  border-radius: 8px;
}

.metadata p {
  margin: 0;
}

.metadata strong {
  color: var(--text-primary);
  margin-right: 8px;
}

.description {
  line-height: 1.6;
  color: var(--text-primary);
  background-color: var(--bg-primary);
  padding: 20px;
  border-radius: 8px;
}

.description h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: var(--text-primary);
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  background-color: var(--bg-primary);
  color: var(--text-secondary);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9em;
  transition: all 0.2s;
}

.tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.actions {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.reading-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.reading-button {
  padding: 12px 24px;
  background-color: var(--text-secondary);
  color: var(--bg-primary);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s;
  flex: 1;
  min-width: 200px;
}

.reading-button:hover {
  background-color: var(--text-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.chapters-button {
  padding: 12px 24px;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s;
}

.chapters-button:hover {
  background-color: var(--hover-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.loading {
  text-align: center;
  padding: 4rem;
  font-size: 1.2rem;
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .manga-header {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .cover-image {
    max-width: 300px;
    margin: 0 auto;
  }

  .manga-info h1 {
    font-size: 1.5rem;
    text-align: center;
  }

  .actions {
    display: flex;
    justify-content: center;
  }
}
</style>
