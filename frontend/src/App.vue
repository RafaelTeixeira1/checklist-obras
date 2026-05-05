<script setup>
import { ref, provide } from 'vue'
import Navigation from './components/Navigation.vue'
import ObrasPage from './pages/ObrasPage.vue'
import ModelosPage from './pages/ModelosPage.vue'
import ItensChecklistPage from './pages/ItensChecklistPage.vue'
import InspecoesPage from './pages/InspecoesPage.vue'
import RespostasInspecaoPage from './pages/RespostasInspecaoPage.vue'

const currentPage = ref('obras')
const apiUrl = 'http://localhost:3000/api'

provide('apiUrl', apiUrl)
</script>

<template>
  <div class="app-container">
    <Navigation :current-page="currentPage" @navigate="currentPage = $event" />
    <main class="main-content">
      <ObrasPage v-if="currentPage === 'obras'" />
      <ModelosPage v-if="currentPage === 'modelos'" />
      <ItensChecklistPage v-if="currentPage === 'itens'" />
      <InspecoesPage v-if="currentPage === 'inspecoes'" />
      <RespostasInspecaoPage v-if="currentPage === 'respostas'" />
    </main>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  background: var(--bg);
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}
</style>
