<template>
  <div class="page">
    <div class="page-header">
      <h2>Obras</h2>
      <button class="btn btn-primary" @click="showForm = !showForm">
        {{ showForm ? '✕ Cancelar' : '+ Nova Obra' }}
      </button>
    </div>

    <div v-if="showForm" class="form-container">
      <form @submit.prevent="createObra">
        <div class="form-group">
          <label>Nome da Obra</label>
          <input 
            v-model="newObra.nome" 
            type="text" 
            placeholder="Ex: Prédio A - Fundações"
            required
          />
        </div>
        <div class="form-group">
          <label>Endereço</label>
          <input 
            v-model="newObra.endereco" 
            type="text" 
            placeholder="Ex: Rua Principal, 123"
            required
          />
        </div>
        <div class="form-group">
          <label>Status</label>
          <select v-model="newObra.status">
            <option value="ativa">Ativa</option>
            <option value="pausada">Pausada</option>
            <option value="concluida">Concluída</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary">Criar Obra</button>
      </form>
    </div>

    <div class="loading" v-if="loading">Carregando...</div>
    <div class="error" v-if="error">{{ error }}</div>

    <div class="obras-grid">
      <div v-for="obra in obras" :key="obra.id" class="obra-card">
        <div class="card-header">
          <h3>{{ obra.nome }}</h3>
          <span class="status" :class="obra.status">{{ obra.status }}</span>
        </div>
        <p><strong>Endereço:</strong> {{ obra.endereco }}</p>
        <p class="text-small">
          Criado em {{ new Date(obra.created_at).toLocaleDateString('pt-BR') }}
        </p>
        <div class="card-actions">
          <button class="btn btn-small" @click="deleteObra(obra.id)">Deletar</button>
        </div>
      </div>
    </div>

    <div v-if="!loading && obras.length === 0" class="empty-state">
      Nenhuma obra criada ainda. Clique em "Nova Obra" para começar.
    </div>
  </div>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue'

const apiUrl = inject('apiUrl')
const obras = ref([])
const loading = ref(true)
const error = ref(null)
const showForm = ref(false)
const newObra = ref({
  nome: '',
  endereco: '',
  status: 'ativa',
})

onMounted(async () => {
  await fetchObras()
})

async function fetchObras() {
  try {
    loading.value = true
    const response = await fetch(`${apiUrl}/obras`)
    if (!response.ok) throw new Error('Erro ao carregar obras')
    obras.value = await response.json()
    error.value = null
  } catch (err) {
    error.value = 'Não foi possível carregar as obras. Verifique se o backend está rodando.'
  } finally {
    loading.value = false
  }
}

async function createObra() {
  try {
    const response = await fetch(`${apiUrl}/obras`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newObra.value),
    })
    if (!response.ok) throw new Error('Erro ao criar obra')
    await fetchObras()
    newObra.value = { nome: '', endereco: '', status: 'ativa' }
    showForm.value = false
  } catch (err) {
    error.value = 'Erro ao criar obra'
  }
}

async function deleteObra(id) {
  if (!confirm('Tem certeza que deseja deletar esta obra?')) return
  try {
    const response = await fetch(`${apiUrl}/obras/${id}`, { method: 'DELETE' })
    if (!response.ok) throw new Error('Erro ao deletar')
    await fetchObras()
  } catch (err) {
    error.value = 'Erro ao deletar obra'
  }
}
</script>

<style scoped>
.page {
  max-width: 1000px;
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
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 14px;
  font-family: var(--sans);
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.obras-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.obra-card {
  background: white;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 20px;
  transition: box-shadow 0.3s;
}

.obra-card:hover {
  box-shadow: var(--shadow);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 12px;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  color: var(--text-h);
  flex: 1;
}

.status {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.status.ativa {
  background: #d1fae5;
  color: #065f46;
}

.status.pausada {
  background: #fef3c7;
  color: #92400e;
}

.status.concluida {
  background: #dbeafe;
  color: #1e40af;
}

.obra-card p {
  margin: 8px 0;
  font-size: 14px;
  color: var(--text);
}

.text-small {
  font-size: 12px;
  color: #9ca3af;
}

.card-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
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
