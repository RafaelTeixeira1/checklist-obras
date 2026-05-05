<template>
  <div class="page">
    <div class="page-header">
      <h2>Itens de Checklist</h2>
      <div class="header-actions">
        <select v-model="selectedModelo" class="select-input">
          <option value="">Selecione um modelo...</option>
          <option v-for="modelo in modelos" :key="modelo.id" :value="modelo.id">
            {{ modelo.nome }}
          </option>
        </select>
        <button class="btn btn-primary" @click="showForm = !showForm">
          {{ showForm ? '✕ Cancelar' : '+ Novo Item' }}
        </button>
      </div>
    </div>

    <div v-if="selectedModelo && showForm" class="form-container">
      <form @submit.prevent="createItem">
        <div class="form-group">
          <label>Descrição do Item</label>
          <input 
            v-model="newItem.descricao" 
            type="text" 
            placeholder="Ex: Verificar fissuras nas paredes"
            required
          />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Ordem</label>
            <input 
              v-model.number="newItem.ordem" 
              type="number" 
              placeholder="0"
            />
          </div>
          <div class="form-group checkbox">
            <input 
              v-model="newItem.obrigatorio" 
              type="checkbox" 
              id="obrigatorio"
            />
            <label for="obrigatorio">Obrigatório</label>
          </div>
        </div>
        <button type="submit" class="btn btn-primary">Criar Item</button>
      </form>
    </div>

    <div class="loading" v-if="loading">Carregando...</div>
    <div class="error" v-if="error">{{ error }}</div>

    <div v-if="!selectedModelo" class="empty-state">
      Selecione um modelo acima para gerenciar seus itens.
    </div>

    <div v-if="selectedModelo && !loading" class="itens-list">
      <div v-for="item in itens" :key="item.id" class="item-card">
        <div class="item-content">
          <div class="item-info">
            <h4>{{ item.descricao }}</h4>
            <div class="item-meta">
              <span v-if="item.obrigatorio" class="badge badge-required">Obrigatório</span>
              <span class="badge badge-order">Ordem: {{ item.ordem }}</span>
            </div>
          </div>
        </div>
        <div class="item-actions">
          <button class="btn btn-small" @click="editItem(item)">Editar</button>
          <button class="btn btn-small" @click="deleteItem(item.id)">Deletar</button>
        </div>
      </div>
    </div>

    <div v-if="selectedModelo && !loading && itens.length === 0" class="empty-state">
      Nenhum item criado para este modelo. Clique em "Novo Item" para começar.
    </div>
  </div>
</template>

<script setup>
import { ref, inject, onMounted, watch } from 'vue'

const apiUrl = inject('apiUrl')
const modelos = ref([])
const itens = ref([])
const selectedModelo = ref('')
const loading = ref(false)
const error = ref(null)
const showForm = ref(false)
const newItem = ref({
  descricao: '',
  ordem: 0,
  obrigatorio: true,
})

onMounted(async () => {
  await fetchModelos()
})

watch(selectedModelo, async (newVal) => {
  if (newVal) {
    await fetchItens()
  } else {
    itens.value = []
  }
})

async function fetchModelos() {
  try {
    const response = await fetch(`${apiUrl}/modelos-checklist`)
    if (!response.ok) throw new Error('Erro ao carregar modelos')
    modelos.value = await response.json()
  } catch (err) {
    error.value = 'Não foi possível carregar os modelos.'
  }
}

async function fetchItens() {
  try {
    loading.value = true
    const response = await fetch(`${apiUrl}/itens-checklist/modelo/${selectedModelo.value}`)
    if (!response.ok) throw new Error('Erro ao carregar itens')
    itens.value = await response.json()
    error.value = null
  } catch (err) {
    error.value = 'Não foi possível carregar os itens.'
  } finally {
    loading.value = false
  }
}

async function createItem() {
  if (!selectedModelo.value) {
    error.value = 'Selecione um modelo primeiro'
    return
  }
  try {
    const response = await fetch(`${apiUrl}/itens-checklist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        modelo_id: parseInt(selectedModelo.value),
        ...newItem.value,
      }),
    })
    if (!response.ok) throw new Error('Erro ao criar item')
    await fetchItens()
    newItem.value = { descricao: '', ordem: 0, obrigatorio: true }
    showForm.value = false
  } catch (err) {
    error.value = 'Erro ao criar item'
  }
}

async function deleteItem(id) {
  if (!confirm('Tem certeza que deseja deletar este item?')) return
  try {
    const response = await fetch(`${apiUrl}/itens-checklist/${id}`, { method: 'DELETE' })
    if (!response.ok) throw new Error('Erro ao deletar')
    await fetchItens()
  } catch (err) {
    error.value = 'Erro ao deletar item'
  }
}

function editItem(item) {
  console.log('Editar:', item)
  // TODO: Implementar edição
}
</script>

<style scoped>
.page {
  max-width: 900px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.page-header h2 {
  margin: 0;
  color: var(--text-h);
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.select-input {
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 14px;
  min-width: 200px;
  background: white;
  cursor: pointer;
}

.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-small {
  padding: 6px 12px;
  font-size: 12px;
  background: #f3f4f6;
  color: #374151;
}

.btn-small:hover {
  background: #e5e7eb;
}

.form-container {
  background: white;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: var(--text-h);
}

.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 14px;
  font-family: var(--sans);
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group.checkbox {
  display: flex;
  align-items: center;
  margin-top: 24px;
}

.form-group.checkbox label {
  margin: 0 0 0 8px;
  display: inline;
}

.form-group.checkbox input {
  width: auto;
  margin-bottom: 0;
}

.itens-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-card {
  background: white;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: box-shadow 0.3s;
}

.item-card:hover {
  box-shadow: var(--shadow);
}

.item-content {
  flex: 1;
}

.item-info h4 {
  margin: 0 0 8px;
  font-size: 15px;
  color: var(--text-h);
}

.item-meta {
  display: flex;
  gap: 8px;
}

.badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.badge-required {
  background: #dbeafe;
  color: #0369a1;
}

.badge-order {
  background: #f3e8ff;
  color: #6b21a8;
}

.item-actions {
  display: flex;
  gap: 8px;
  margin-left: 16px;
}

.loading,
.error,
.empty-state {
  text-align: center;
  padding: 32px 20px;
  color: var(--text);
}

.error {
  color: #dc2626;
  background: #fee2e2;
  border-radius: 6px;
}
</style>
