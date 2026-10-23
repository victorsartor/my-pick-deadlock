// Fontes servidas pelo próprio site (antes vinham do Google Fonts, com dois domínios extras para conectar).
import '@fontsource-variable/inter'
import '@fontsource-variable/oswald'
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import { carregarTelaResultado, preconectarVotos } from './services/preCarregar'
import './style.css'
import HomeView from './views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    // Carregada sob demanda (e já no hover do card, via preCarregarResultado).
    { path: '/:jogo/:personagem', name: 'resultado', component: carregarTelaResultado, props: true },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  // Ao voltar, retorna à posição de rolagem anterior; em navegação nova, vai ao topo.
  scrollBehavior: (_to, _from, salva) => salva ?? { top: 0 },
})

createApp(App).use(router).mount('#app')
preconectarVotos()
