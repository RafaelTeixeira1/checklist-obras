<template>
  <div class="page">
    <div class="page-header">
      <h2>Respostas de Inspeção</h2>
      <div class="header-actions">
        <select v-model="selectedInspecao" class="select-input">
          <option value="">Selecione uma inspeção...</option>
          <option v-for="insp in inspecoes" :key="insp.id" :value="insp.id">
            {{ getObraNome(insp.obra_id) }} - {{ formatDate(insp.data_inspecao) }}
          </option>
        </select>
      </div>
    </div>

    <div class="loading" v-if="loading">Carregando...</div>
    <div class="error" v-if="error">{{ error }}</div>

    <div v-if="!selectedInspecao" class="empty-state">
      Selecione uma inspeção acima para gerenciar suas respostas.
    </div>

    <div v-if="selectedInspecao && !loading" class="respostas-container">
      <div class="inspecao-info" v-if="currentInspecao">
        <div>
          <h3>{{ getObraNome(currentInspecao.obra_id) }}</h3>
          <p>{{ formatDate(currentInspecao.data_inspecao) }}</p>
        </div>
        <span :class="['status', 'status-' + currentInspecao.status]">{{ currentInspecao.status }}</span>
      </div>

      <div class="itens-list">
        <div v-for="(item, index) in itens" :key="item.id" class="item-resposta">
          <div class="item-header">
            <span class="item-numero">{{ index + 1 }}</span>
            <div class="item-info">
              <h4>{{ item.descricao }}</h4>
              <span v-if="item.obrigatorio" class="badge badge-required">Obrigatório</span>
            </div>
          </div>

          <div class="resposta-input">
            <div class="status-options">
              <label v-for="status in statusOptions" :key="status" class="radio-option">
                <input 
                  type="radio" 
                  :value="status"
                  :checked="getResposta(item.id)?.status === status"
                  @change="updateResposta(item.id, status, '')"
                />
                <span :class="['radio-label', 'status-' + status]">{{ formatStatus(status) }}</span>
              </label>
            </div>
            <textarea 
              :value="getResposta(item.id)?.observacao || ''"
              @input="updateResposta(item.id, getResposta(item.id)?.status || 'nao_aplicavel', $event.target.value)"
              placeholder="Observações (opcional)"
              rows="2"
              class="observacao-input"
            ></textarea>
          </div>
        </div>
      </div>

      <div class="actions-bar">
        <button class="btn btn-primary" @click="saveRespostas">💾 Salvar Respostas</button>
        <button class="btn btn-secondary" @click="finalizarInspecao">✓ Finalizar Inspeção</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, onMounted, watch, computed } from 'vue'

const apiUrl = inject('apiUrl')
const obras = ref([])
const inspecoes = ref([])
const itens = ref([])
const respostas = ref([])
const selectedInspecao = ref('')
const loading = ref(false)
const error = ref(null)

const statusOptions = ['conforme', 'nao_conforme', 'nao_aplicavel']

const currentInspecao = computed(() => {
  return inspecoes.value.find(i => i.id === parseInt(selectedInspecao.value))
})

onMounted(async () => {
  await Promise.all([fetchObras(), fetchInspecoes()])
})

watch(selectedInspecao, async (newVal) => {
  if (newVal) {
    await loadInspecaoData()
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

async function fetchInspecoes() {
  try {
    const response = await fetch(`${apiUrl}/inspecoes`)
    if (!response.ok) throw new Error('Erro ao carregar inspeções')
    inspecoes.value = await response.json()
  } catch (err) {
    error.value = 'Não foi possível carregar as inspeções.'
  }
}

async function loadInspecaoData() {
  try {
    loading.value = true
    const insp = currentInspecao.value
    
    // Fetch itens do checklist
    const itensRes = await fetch(`${apiUrl}/itens-checklist/modelo/${insp.modelo_id}`)
    if (!itensRes.ok) throw new Error('Erro ao carregar itens')
    itens.value = await itensRes.json()
    
    // Fetch respostas existentes
    const respostasRes = await fetch(`${apiUrl}/respostas-inspecao/inspecao/${insp.id}`)
    if (!respostasRes.ok) throw new Error('Erro ao carregar respostas')
    respostas.value = await respostasRes.json()
    
    error.value = null
  } catch (err) {
    error.value = 'Não foi possível carregar os dados da inspeção.'
  } finally {
    loading.value = false
  }
}

function getResposta(itemId) {
  return respostas.value.find(r => r.item_id === itemId)
}

function updateResposta(itemId, status, observacao) {
  const existing = getResposta(itemId)
  if (existing) {
    existing.status = status
    existing.observacao = observacao
  } else {
    respostas.value.push({
      inspecao_id: parseInt(selectedInspecao.value),
      item_id: itemId,
      status,
      observacao,
    })
  }
}

async function saveRespostas() {
  try {
    loading.value = true
    
    for (const resposta of respostas.value) {
      const existingId = resposta.id
      
      if (existingId) {
        // Atualizar
        const response = await fetch(`${apiUrl}/respostas-inspecao/${existingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(resposta),
        })
        if (!response.ok) throw new Error('Erro ao atualizar resposta')
      } else {
        // Criar
        const response = await fetch(`${apiUrl}/respostas-inspecao`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(resposta),
        })
        if (!response.ok) throw new Error('Erro ao criar resposta')
      }
    }
    
    error.value = null
    alert('Respostas salvas com sucesso!')
    await loadInspecaoData()
  } catch (err) {
    error.value = 'Erro ao salvar respostas'
  } finally {
    loading.value = false
  }
}

async function finalizarInspecao() {
  if (!confirm('Tem certeza que deseja finalizar esta inspeção?')) return
  
  try {
    const response = await fetch(`${apiUrl}/inspecoes/${selectedInspecao.value}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'concluida' }),
    })
    if (!response.ok) throw new Error('Erro ao finalizar')
    
    await fetchInspecoes()
    selectedInspecao.value = ''
    alert('Inspeção finalizada com sucesso!')
  } catch (err) {
    error.value = 'Erro ao finalizar inspeção'
  }
}

function getObraNome(obraId) {
  return obras.value.find(o => o.id === obraId)?.nome || 'Desconhecida'
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('pt-BR')
}

function formatStatus(status) {
  const map = {
    'conforme': '✓ Conforme',
    'nao_conforme': '✗ Não Conforme',
    'nao_aplicavel': '- N/A',
  }
  return map[status] || status
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
  gap: 16px;
  margin-bottom: 32px;
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
  min-width: 250px;
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

.btn-secondary {
  background: #10b981;
  color: white;
}

.btn-secondary:hover {
  background: #059669;
}

.inspecao-info {
  background: white;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.inspecao-info h3 {
  margin: 0 0 4px;
  font-size: 16px;
  color: var(--text-h);
}

.inspecao-info p {
  margin: 0;
  font-size: 13px;
  color: #9ca3af;
}

.status {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
}

.status-pendente {
  background: #fef3c7;
  color: #92400e;
}

.status-concluida {
  background: #dcfce7;
  color: #166534;
}

.itens-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.item-resposta {
  background: white;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px;
}

.item-header {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  align-items: start;
}

.item-numero {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: #667eea;
  color: white;
  border-radius: 50%;
  font-weight: 500;
  font-size: 13px;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
}

.item-info h4 {
  margin: 0 0 4px;
  font-size: 15px;
  color: var(--text-h);
}

.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 500;
}

.badge-required {
  background: #dbeafe;
  color: #0369a1;
}

.resposta-input {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-options {
  display: flex;
  gap: 16px;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
}

.radio-option input {
  cursor: pointer;
}

.radio-label {
  padding: 4px 10px;
  border-radius: 4px;
  font-weight: 500;
  display: inline-block;
}

.radio-label.status-conforme {
  background: #dcfce7;
  color: #166534;
}

.radio-label.status-nao_conforme {
  background: #fee2e2;
  color: #dc2626;
}

.radio-label.status-nao_aplicavel {
  background: #f3f4f6;
  color: #6b7280;
}

.observacao-input {
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 13px;
  font-family: var(--sans);
  resize: vertical;
}

.observacao-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.actions-bar {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: white;
  border: 1px solid var(--border);
  border-radius: 8px;
  margin-top: 24px;
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
