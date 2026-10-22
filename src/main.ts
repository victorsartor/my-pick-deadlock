import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './style.css'
import HomeView from './views/HomeView.vue'
import ResultView from './views/ResultView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/:jogo/:personagem', name: 'resultado', component: ResultView, props: true },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  // Ao voltar, retorna à posição de rolagem anterior; em navegação nova, vai ao topo.
  scrollBehavior: (_to, _from, salva) => salva ?? { top: 0 },
})

createApp(App).use(router).mount('#app')
