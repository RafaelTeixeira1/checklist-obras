<template>
  <div class="page">
    <div class="page-header">
      <h2>Modelos de Checklist</h2>
      <button class="btn btn-primary" @click="showForm = !showForm">
        {{ showForm ? '✕ Cancelar' : '+ Novo Modelo' }}
      </button>
    </div>

    <div v-if="showForm" class="form-container">
      <form @submit.prevent="createModelo">
        <div class="form-group">
          <label>Nome do Modelo</label>
          <input 
            v-model="newModelo.nome" 
            type="text" 
            placeholder="Ex: Inspeção Estrutural"
            required
          />
        </div>
        <div class="form-group">
          <label>Descrição</label>
          <textarea 
            v-model="newModelo.descricao" 
            placeholder="Descrição do modelo de checklist"
            rows="4"
          ></textarea>
        </div>
        <button type="submit" class="btn btn-primary">Criar Modelo</button>
      </form>
    </div>

    <div class="loading" v-if="loading">Carregando...</div>
    <div class="error" v-if="error">{{ error }}</div>

    <div class="modelos-list">
      <div v-for="modelo in modelos" :key="modelo.id" class="modelo-item">
        <div class="item-header">
          <div>
            <h3>{{ modelo.nome }}</h3>
            <p v-if="modelo.descricao" class="descricao">{{ modelo.descricao }}</p>
          </div>
          <span class="date">{{ new Date(modelo.created_at).toLocaleDateString('pt-BR') }}</span>
        </div>
        <div class="item-actions">
          <button class="btn btn-small" @click="editModelo(modelo)">Editar</button>
          <button class="btn btn-small" @click="deleteModelo(modelo.id)">Deletar</button>
        </div>
      </div>
    </div>

    <div v-if="!loading && modelos.length === 0" class="empty-state">
      Nenhum modelo criado ainda. Clique em "Novo Modelo" para começar.
    </div>
  </div>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue'

const apiUrl = inject('apiUrl')
const modelos = ref([])
const loading = ref(true)
const error = ref(null)
const showForm = ref(false)
const newModelo = ref({
  nome: '',
  descricao: '',
})

onMounted(async () => {
  await fetchModelos()
})

async function fetchModelos() {
  try {
    loading.value = true
    const response = await fetch(`${apiUrl}/modelos-checklist`)
    if (!response.ok) throw new Error('Erro ao carregar modelos')
    modelos.value = await response.json()
    error.value = null
  } catch (err) {
    error.value = 'Não foi possível carregar os modelos. Verifique se o backend está rodando.'
  } finally {
    loading.value = false
  }
}

async function createModelo() {
  try {
    const response = await fetch(`${apiUrl}/modelos-checklist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newModelo.value),
    })
    if (!response.ok) throw new Error('Erro ao criar modelo')
    await fetchModelos()
    newModelo.value = { nome: '', descricao: '' }
    showForm.value = false
  } catch (err) {
    error.value = 'Erro ao criar modelo'
  }
}

async function deleteModelo(id) {
  if (!confirm('Tem certeza que deseja deletar este modelo?')) return
  try {
    const response = await fetch(`${apiUrl}/modelos-checklist/${id}`, { method: 'DELETE' })
    if (!response.ok) throw new Error('Erro ao deletar')
    await fetchModelos()
  } catch (err) {
    error.value = 'Erro ao deletar modelo'
  }
}

function editModelo(modelo) {
  console.log('Editar:', modelo)
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
  margin-bottom: 32px;
}

.page-header h2 {
  margin: 0;
  color: var(--text-h);
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

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: var(--text-h);
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 14px;
  font-family: var(--sans);
}

.form-group textarea {
  resize: vertical;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.modelos-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.modelo-item {
  background: white;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 20px;
  transition: box-shadow 0.3s;
}

.modelo-item:hover {
  box-shadow: var(--shadow);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 16px;
}

.item-header h3 {
  margin: 0 0 8px;
  font-size: 16px;
  color: var(--text-h);
}

.descricao {
  margin: 0;
  font-size: 14px;
  color: var(--text);
  line-height: 1.4;
}

.date {
  font-size: 12px;
  color: #9ca3af;
  white-space: nowrap;
  padding-left: 16px;
}

.item-actions {
  display: flex;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
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
