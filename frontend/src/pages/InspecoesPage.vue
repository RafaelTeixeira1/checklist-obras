<template>
  <div class="page">
    <div class="page-header">
      <h2>Inspeções</h2>
      <div class="header-actions">
        <select v-model="selectedObra" class="select-input">
          <option value="">Selecione uma obra...</option>
          <option v-for="obra in obras" :key="obra.id" :value="obra.id">
            {{ obra.nome }}
          </option>
        </select>
        <button class="btn btn-primary" @click="showForm = !showForm">
          {{ showForm ? '✕ Cancelar' : '+ Nova Inspeção' }}
        </button>
      </div>
    </div>

    <div v-if="selectedObra && showForm" class="form-container">
      <form @submit.prevent="createInspecao">
        <div class="form-group">
          <label>Modelo de Checklist</label>
          <select v-model.number="newInspecao.modelo_id" required>
            <option value="">Selecione um modelo...</option>
            <option v-for="modelo in modelos" :key="modelo.id" :value="modelo.id">
              {{ modelo.nome }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>Data da Inspeção</label>
          <input 
            v-model="newInspecao.data_inspecao" 
            type="date" 
            required
          />
        </div>
        <div class="form-group">
          <label>Observações</label>
          <textarea 
            v-model="newInspecao.observacoes" 
            placeholder="Observações sobre a inspeção"
            rows="4"
          ></textarea>
        </div>
        <button type="submit" class="btn btn-primary">Criar Inspeção</button>
      </form>
    </div>

    <div class="loading" v-if="loading">Carregando...</div>
    <div class="error" v-if="error">{{ error }}</div>

    <div v-if="!selectedObra" class="empty-state">
      Selecione uma obra acima para gerenciar suas inspeções.
    </div>

    <div v-if="selectedObra && !loading" class="inspecoes-list">
      <div v-for="inspecao in inspecoes" :key="inspecao.id" class="inspecao-card">
        <div class="card-header">
          <div>
            <h4>{{ getModeloNome(inspecao.modelo_id) }}</h4>
            <p class="data">{{ formatDate(inspecao.data_inspecao) }}</p>
          </div>
          <span :class="['status', 'status-' + inspecao.status]">{{ inspecao.status }}</span>
        </div>
        <div v-if="inspecao.observacoes" class="observacoes">
          <strong>Observações:</strong>
          <p>{{ inspecao.observacoes }}</p>
        </div>
        <div class="card-actions">
          <button class="btn btn-small" @click="viewInspecao(inspecao)">Ver Detalhes</button>
          <button class="btn btn-small" @click="deleteInspecao(inspecao.id)">Deletar</button>
        </div>
      </div>
    </div>

    <div v-if="selectedObra && !loading && inspecoes.length === 0" class="empty-state">
      Nenhuma inspeção criada para esta obra. Clique em "Nova Inspeção" para começar.
    </div>
  </div>
</template>

<script setup>
import { ref, inject, onMounted, watch } from 'vue'

const apiUrl = inject('apiUrl')
const obras = ref([])
const modelos = ref([])
const inspecoes = ref([])
const selectedObra = ref('')
const loading = ref(false)
const error = ref(null)
const showForm = ref(false)
const newInspecao = ref({
  modelo_id: '',
  data_inspecao: new Date().toISOString().split('T')[0],
  observacoes: '',
})

onMounted(async () => {
  await Promise.all([fetchObras(), fetchModelos()])
})

watch(selectedObra, async (newVal) => {
  if (newVal) {
    await fetchInspecoes()
  } else {
    inspecoes.value = []
  }
})

async function fetchObras() {
  try {
    const response = await fetch(`${apiUrl}/obras`)
    if (!response.ok) throw new Error('Erro ao carregar obras')
    obras.value = await response.json()
  } catch (err) {
    error.value = 'Não foi possível carregar as obras.'
  }
}

async function fetchModelos() {
  try {
    const response = await fetch(`${apiUrl}/modelos-checklist`)
    if (!response.ok) throw new Error('Erro ao carregar modelos')
    modelos.value = await response.json()
  } catch (err) {
    console.error('Erro ao carregar modelos:', err)
  }
}

async function fetchInspecoes() {
  try {
    loading.value = true
    const response = await fetch(`${apiUrl}/inspecoes/obra/${selectedObra.value}`)
    if (!response.ok) throw new Error('Erro ao carregar inspeções')
    inspecoes.value = await response.json()
    error.value = null
  } catch (err) {
    error.value = 'Não foi possível carregar as inspeções.'
  } finally {
    loading.value = false
  }
}

async function createInspecao() {
  if (!selectedObra.value) {
    error.value = 'Selecione uma obra primeiro'
    return
  }
  try {
    const response = await fetch(`${apiUrl}/inspecoes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        obra_id: parseInt(selectedObra.value),
        ...newInspecao.value,
      }),
    })
    if (!response.ok) throw new Error('Erro ao criar inspeção')
    await fetchInspecoes()
    newInspecao.value = {
      modelo_id: '',
      data_inspecao: new Date().toISOString().split('T')[0],
      observacoes: '',
    }
    showForm.value = false
  } catch (err) {
    error.value = 'Erro ao criar inspeção'
  }
}

async function deleteInspecao(id) {
  if (!confirm('Tem certeza que deseja deletar esta inspeção?')) return
  try {
    const response = await fetch(`${apiUrl}/inspecoes/${id}`, { method: 'DELETE' })
    if (!response.ok) throw new Error('Erro ao deletar')
    await fetchInspecoes()
  } catch (err) {
    error.value = 'Erro ao deletar inspeção'
  }
}

function getModeloNome(modeloId) {
  return modelos.value.find(m => m.id === modeloId)?.nome || 'Desconhecido'
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('pt-BR')
}

function viewInspecao(inspecao) {
  console.log('Ver detalhes:', inspecao)
  // TODO: Implementar visualização de detalhes
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

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: var(--text-h);
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 14px;
  font-family: var(--sans);
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.inspecoes-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.inspecao-card {
  background: white;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px;
  transition: box-shadow 0.3s;
}

.inspecao-card:hover {
  box-shadow: var(--shadow);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 12px;
}

.card-header h4 {
  margin: 0 0 4px;
  font-size: 15px;
  color: var(--text-h);
}

.data {
  margin: 0;
  font-size: 13px;
  color: #9ca3af;
}

.status {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
}

.status-pendente {
  background: #fef3c7;
  color: #92400e;
}

.status-em_progresso {
  background: #dbeafe;
  color: #0369a1;
}

.status-concluida {
  background: #dcfce7;
  color: #166534;
}

.observacoes {
  margin: 12px 0;
  padding: 12px;
  background: #f9fafb;
  border-left: 3px solid #667eea;
  border-radius: 4px;
}

.observacoes strong {
  display: block;
  margin-bottom: 4px;
  font-size: 13px;
  color: var(--text-h);
}

.observacoes p {
  margin: 0;
  font-size: 14px;
  color: var(--text);
  line-height: 1.4;
}

.card-actions {
  display: flex;
  gap: 8px;
  padding-top: 12px;
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
