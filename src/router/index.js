import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import MangaDetail from '../views/MangaDetail.vue'
import ChapterList from '../views/ChapterList.vue'
import ChapterReader from '../views/ChapterReader.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/manga/:id',
      name: 'manga-detail',
      component: MangaDetail
    },
    {
      path: '/chapters/:id',
      name: 'chapter-list',
      component: ChapterList
    },
    {
      path: '/read/:id',
      name: 'chapter-reader',
      component: ChapterReader
    }
  ]
})

export default router
