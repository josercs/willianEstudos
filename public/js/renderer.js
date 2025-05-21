// renderer.js (modularizado)
import { getHorarios, getGraficoEstudos, getGraficoStatus } from './api.js';
import { atualizarCards } from './cards.js';
import { mostrarModalConfirmacao } from './modal.js';
import { renderTabelaComDados } from './tabela.js';


let horariosCache = [];
let paginaAtual = 1;
const itensPorPagina = Number.MAX_SAFE_INTEGER;

function paginar(dados, pagina = 1) {
  const inicio = (pagina - 1) * itensPorPagina;
  return dados.slice(inicio, inicio + itensPorPagina);
}

function atualizarPaginacao(totalItens, dadosFiltrados = null) {
  const totalPaginas = Math.ceil(totalItens / itensPorPagina);
  const paginacaoDiv = document.getElementById('paginacao');
  paginacaoDiv.innerHTML = '';
  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.disabled = i === paginaAtual;
    btn.onclick = () => {
      paginaAtual = i;
      renderTabelaComDados(paginar(dadosFiltrados || horariosCache, paginaAtual));
      atualizarPaginacao(totalItens, dadosFiltrados);
    };
    paginacaoDiv.appendChild(btn);
  }
}

function mostrarLoading(mostrar) {
  document.getElementById('loading').style.display = mostrar ? '' : 'none';
}
function mostrarErro(msg) {
  const erro = document.getElementById('erro');
  if (!erro) return;
  erro.textContent = msg;
  erro.style.display = msg ? '' : 'none';
}

async function carregarHorarios() {
  mostrarLoading(true);
  mostrarErro('');
  try {
    horariosCache = await getHorarios();
    paginaAtual = 1;
    renderTabelaComDados(paginar(horariosCache, paginaAtual));
    atualizarPaginacao(horariosCache.length, horariosCache);
  } 
  finally {
    mostrarLoading(false);
  }
}


async function carregarGraficoStatus() {
  try {
    const dados = await getGraficoStatus();
    renderizarGraficoStatus(dados);
  } catch (e) {
    mostrarErro('Erro ao carregar gráfico de status.');
  }
}

function aplicarFiltros() {
  let filtrados = horariosCache;

  // Filtro por dia
  const dia = document.getElementById('filtro-dia').value;
  if (dia) {
    filtrados = filtrados.filter(h => (h.dia || '').slice(0, 10) === dia);
  }

  // Filtro por mês
  const mes = document.getElementById('filtro-mes').value;
  if (mes) {
    filtrados = filtrados.filter(h => (h.dia || '').slice(0, 7) === mes);
  }

  // Filtro por semana (YYYY-Wxx)
  const semana = document.getElementById('filtro-semana').value;
  if (semana) {
    filtrados = filtrados.filter(h => {
      if (!h.dia) return false;
      const data = new Date(h.dia);
      const ano = data.getFullYear();
      // Calcula semana ISO
      const primeiraQuinta = new Date(data.setDate(data.getDate() + 4 - (data.getDay() || 7)));
      const semanaISO = Math.ceil((((primeiraQuinta - new Date(primeiraQuinta.getFullYear(),0,1)) / 86400000) + 1)/7);
      const semanaStr = `${ano}-W${String(semanaISO).padStart(2, '0')}`;
      return semanaStr === semana;
    });
  }

  // Filtro por matéria
  const materia = document.getElementById('filtro-materia').value;
  if (materia) {
    filtrados = filtrados.filter(h => (h.materia || '') === materia);
  }

  paginaAtual = 1;
  renderTabelaComDados(paginar(filtrados, paginaAtual));
  atualizarPaginacao(filtrados.length, filtrados);
}

function renderizarGraficoStatus(dados) {
  const ctx = document.getElementById('grafico').getContext('2d');
  if (window.graficoStatus) window.graficoStatus.destroy(); // Evita sobreposição
  window.graficoStatus = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: dados.labels,
      datasets: [{
        label: 'Status dos Estudos',
        data: dados.valores,
        backgroundColor: [
          '#fbbf24', // A Fazer (amarelo)
          '#3b82f6', // Em Andamento (azul)
          '#10b981'  // Concluído (verde)
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true, position: 'bottom' }
      }
    }
  });
}

window.addEventListener('DOMContentLoaded', async () => {
  await atualizarCards();

  // Menu de navegação
  document.querySelectorAll('nav button').forEach(btn => {
    btn.addEventListener('click', async () => {
      document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const aba = btn.dataset.section;

      // Mostra a tabela tanto em "filtrar" quanto em "estudos"
      const mostrarTabela = aba === 'filtrar' || aba === 'estudos';
      
      const tabelaEstudos = document.getElementById('tabela-estudos');
      if (tabelaEstudos) tabelaEstudos.style.display = mostrarTabela ? '' : 'none';

      const paginacao = document.getElementById('paginacao');
      if (paginacao) paginacao.style.display = mostrarTabela ? '' : 'none';

      const paginacaoElem = document.getElementById('paginacao');
      if (paginacaoElem) paginacaoElem.style.display = mostrarTabela ? '' : 'none';

      const exportarCsv = document.getElementById('exportar-csv');
      if (exportarCsv) exportarCsv.style.display = mostrarTabela ? '' : 'none';

      if (mostrarTabela) {
        await carregarHorarios();
      }
    });
  });

  // Busca na tabela
  document.getElementById('busca-tabela').addEventListener('input', function() {
    const termo = this.value.toLowerCase();
    const filtrados = horariosCache.filter(h =>
      (h.materia || '').toLowerCase().includes(termo) ||
      (h.conteudo || '').toLowerCase().includes(termo)
    );
    paginaAtual = 1;
    renderTabelaComDados(paginar(filtrados, paginaAtual));
    atualizarPaginacao(filtrados.length, filtrados);
  });

  // Exportação CSV
  document.getElementById('exportar-csv').addEventListener('click', () => {
    let csv = 'Dia,Horário,Matéria,Conteúdo,Status,Prioridade\n';
    horariosCache.forEach(h => {
      csv += [
        h.dia, h.horario, h.materia, h.conteudo, h.status, h.prioridade
      ].map(v => `"${v || ''}"`).join(',') + '\n';
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'estudos.csv';
    a.click();
    URL.revokeObjectURL(url);
  });

  // Eventos dos filtros
  ['filtro-dia', 'filtro-mes', 'filtro-materia', 'filtro-semana'].forEach(id => {
    document.getElementById(id).addEventListener('input', aplicarFiltros);
  });
  document.getElementById('limpar-filtros').addEventListener('click', () => {
    document.getElementById('filtro-dia').value = '';
    document.getElementById('filtro-mes').value = '';
    document.getElementById('filtro-materia').value = '';
    document.getElementById('filtro-semana').value = '';
    aplicarFiltros();
  });

  // Carrega dados ao iniciar na aba correta
  const abaAtiva = document.querySelector('nav button.active')?.dataset.section;
  if (abaAtiva === 'filtrar' || abaAtiva === 'estudos') {
    await carregarHorarios();
  }

  // Ativa a aba "Estudos" ao carregar
  document.querySelector('[data-section="estudos"]').click();

  // Carrega gráfico ao iniciar
  
  await carregarGraficoStatus();
});
