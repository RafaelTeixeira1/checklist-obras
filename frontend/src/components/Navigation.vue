<template>
  <nav class="navbar">
    <div class="navbar-header">
      <h1>Checklist Obras</h1>
    </div>
    <ul class="nav-menu">
      <li>
        <button 
          class="nav-item"
          :class="{ active: currentPage === 'obras' }"
          @click="$emit('navigate', 'obras')"
        >
          📋 Obras
        </button>
      </li>
      <li>
        <button 
          class="nav-item"
          :class="{ active: currentPage === 'modelos' }"
          @click="$emit('navigate', 'modelos')"
        >
          📝 Modelos
        </button>
      </li>
      <li>
        <button 
          class="nav-item"
          :class="{ active: currentPage === 'itens' }"
          @click="$emit('navigate', 'itens')"
        >
          ✓ Itens
        </button>
      </li>
      <li>
        <button 
          class="nav-item"
          :class="{ active: currentPage === 'inspecoes' }"
          @click="$emit('navigate', 'inspecoes')"
        >
          🔍 Inspeções
        </button>
      </li>
      <li>
        <button 
          class="nav-item"
          :class="{ active: currentPage === 'respostas' }"
          @click="$emit('navigate', 'respostas')"
        >
          📊 Respostas
        </button>
      </li>
    </ul>
  </nav>
</template>

<script setup>
defineProps({
  currentPage: String,
})

defineEmits(['navigate'])
</script>

<style scoped>
.navbar {
  width: 250px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e5e4e7;
}

.navbar-header {
  padding: 24px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.navbar-header h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.nav-menu {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
}

.nav-item {
  width: 100%;
  padding: 16px 20px;
  border: none;
  background: transparent;
  color: white;
  font-size: 16px;
  cursor: pointer;
  text-align: left;
  transition: background 0.3s;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.2);
  border-left: 4px solid white;
  padding-left: 16px;
}
</style>
