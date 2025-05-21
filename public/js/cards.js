// cards.js

import { getEstatisticas } from './api.js';

export async function atualizarCards() {
  const stats = await getEstatisticas().catch(err => {
    console.error('Erro ao buscar estatísticas:', err);
    return { concluidos: 0, eficiencia: 0, tempoEstudado: 0 }; // fallback
  });

  atualizarCardConcluidos(stats.concluidos, stats.eficiencia);
  atualizarCardTempoEstudado(stats.tempoEstudado);
}

function atualizarCardConcluidos(qtd, eficiencia) {
  document.getElementById('card-concluidos').textContent = qtd;
  document.getElementById('card-concluidos-info').textContent = `${eficiencia}% de eficiência`;
}

function atualizarCardTempoEstudado(minutos) {
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  document.getElementById('card-tempo-estudado').textContent = `${horas}h ${mins}m`;
  document.getElementById('card-tempo-estudado-info').textContent = 'Meta: 10h semanais';
}
