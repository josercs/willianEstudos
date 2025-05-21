// api.js
const API_URL = '/api/horarios';

export const STATUS = {
  A_FAZER: 'a fazer',
  EM_PROGRESO: 'em progresso',
  CONCLUIDO: 'concluido'
};

export async function getHorarios() {
  const res = await fetch(API_URL);
  return await res.json();
}

export async function novoEstudo(dados) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });
  return await res.json();
}

export async function editarEstudo(id, dados) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });
  return await res.json();
}

export async function excluirEstudo(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  return await res.json();
}

export async function getEstatisticas() {
  const res = await fetch('/api/estatisticas');
  if (!res.ok) throw new Error('Erro ao buscar estatísticas');
  return await res.json(); // já retorna o objeto pronto para os cards
}

export async function getGraficoEstudos() {
  const res = await fetch('/api/grafico-estudos');
  if (!res.ok) throw new Error('Erro ao buscar dados do gráfico');
  return await res.json();
}

export async function getGraficoStatus() {
  const res = await fetch('/api/grafico-status');
  if (!res.ok) throw new Error('Erro ao buscar dados do gráfico de status');
  return await res.json();
}
