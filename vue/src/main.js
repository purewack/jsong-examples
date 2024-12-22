import { createApp } from 'vue'

import App from './App.vue'
import Home from './pages/Home.vue'
import Game from './pages/Game.vue'
import About from './pages/About.vue'

import { createWebHistory, createRouter } from 'vue-router'


const routes = [
  { path: '/', component: Home },
  { path: '/game', component: Game },
  { path: '/about', component: About },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

createApp(App)
.use(router)
.mount('#app')
