const API_URL = '/api/horarios';

const STATUS = {
  A_FAZER: 'a fazer',
  EM_PROGRESO: 'em progresso',
  CONCLUIDO: 'concluido'
};

// Buscar todos os horários
async function getHorarios() {
  const res = await fetch(API_URL);
  return await res.json();
}

// Salvar novo estudo
async function novoEstudo(dados) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });
  return await res.json();
}

// Editar estudo
async function editarEstudo(id, dados) {
  const res = await fetch(`/api/horarios/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });
  return await res.json();
}

// Excluir estudo
async function excluirEstudo(id) {
  const res = await fetch(`/api/horarios/${id}`, { method: 'DELETE' });
  return await res.json();
}

function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = 'toast show ' + type;
  setTimeout(() => { toast.className = 'toast'; }, 3000);
}

function formatarData(dia) {
  if (!dia) return '';
  const data = new Date(dia);
  if (isNaN(data)) return dia;
  const dias = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  return `${data.getDate()} ${meses[data.getMonth()]} (${dias[data.getDay()]})`;
}

function mostrarModalConfirmacao(msg, tempo = 2000) {
  const modal = document.getElementById('modal-confirmacao');
  const msgDiv = document.getElementById('modal-confirmacao-msg');
  msgDiv.textContent = msg;
  modal.style.display = 'flex';
  // Fecha automaticamente após o tempo definido
  setTimeout(() => {
    modal.style.display = 'none';
  }, tempo);
  // Permite fechar manualmente também
  document.getElementById('fechar-modal-confirmacao').onclick = () => {
    modal.style.display = 'none';
  };
}

function normalizarStatus(status) {
  return (status || '').trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function filtrarPorDia(horarios, diaStr) {
  return horarios.filter(h => h.dia && h.dia.slice(0, 10) === diaStr);
}

function contarStatus(horarios) {
  const statusCount = { 'A Fazer': 0, 'Em Progresso': 0, 'Concluído': 0 };
  horarios.forEach(h => {
    const status = normalizarStatus(h.status);
    if (status === STATUS.A_FAZER) statusCount['A Fazer']++;
    else if (status === STATUS.EM_PROGRESO) statusCount['Em Progresso']++;
    else if (status === STATUS.CONCLUIDO) statusCount['Concluído']++;
  });
  return statusCount;
}

function atualizarCardEstudosHoje(qtd, diferenca) {
  document.getElementById('card-estudos-hoje').textContent = qtd;
  let texto = 'Igual a ontem';
  if (diferenca > 0) texto = `+${diferenca} em relação a ontem`;
  else if (diferenca < 0) texto = `${diferenca} em relação a ontem`;
  document.getElementById('card-estudos-hoje-info').textContent = texto;
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

// --- Atualização dos cards principais ---
async function atualizarCards() {
  const horarios = await getHorarios();

  // Estudos hoje (com horário preenchido e não concluídos)
  const hoje = new Date();
  const hojeStr = hoje.toISOString().slice(0, 10);
  const ontem = new Date(hoje);
  ontem.setDate(hoje.getDate() - 1);
  const ontemStr = ontem.toISOString().slice(0, 10);

  const filtroEstudo = h =>
    h.horario && h.horario.trim() !== '' &&
    normalizarStatus(h.status) !== STATUS.CONCLUIDO;

  const estudosHoje = horarios.filter(h => h.dia && h.dia.slice(0, 10) === hojeStr && filtroEstudo(h));
  const estudosOntem = horarios.filter(h => h.dia && h.dia.slice(0, 10) === ontemStr && filtroEstudo(h));
  atualizarCardEstudosHoje(estudosHoje.length, estudosHoje.length - estudosOntem.length);

  // Concluídos (mesma lógica do gráfico)
  const statusCount = contarStatus(horarios);
  const total = Object.values(statusCount).reduce((a, b) => a + b, 0);
  const eficiencia = total ? Math.round((statusCount['Concluído'] / total) * 100) : 0;
  atualizarCardConcluidos(statusCount['Concluído'], eficiencia);

  // Tempo estudado
  const minutos = horarios.reduce((acc, h) => acc + (h.duracaoMinutos || 0), 0);
  atualizarCardTempoEstudado(minutos);
}

function $(selector) {
  return document.querySelector(selector);
}
function $all(selector) {
  return document.querySelectorAll(selector);
}

window.addEventListener('DOMContentLoaded', () => {
  const output = document.getElementById('output');
  const filtroPeriodo = document.getElementById('filtro-periodo');
  const filtroMes = document.getElementById('filtro-mes');
  const filtroStatus = document.getElementById('filtro-status');
  const filtroPrioridade = document.getElementById('filtro-prioridade');
  const filtrosDiv = document.getElementById('filtros');
  const filtrosInfo = document.getElementById('filtros-info');
  const loading = document.getElementById('loading');
  const buscaTabela = document.getElementById('busca-tabela');
  const exportarCsvBtn = document.getElementById('exportar-csv');
  const btnCartao = document.getElementById('modo-cartao');
  const btnTabela = document.getElementById('modo-tabela');
  const btnNovoEstudo = document.getElementById('novo-estudo');
  const modalEstudo = document.getElementById('modal-estudo');
  const fecharModal = document.getElementById('fechar-modal');
  const formEstudo = document.getElementById('form-estudo');

  // Função para mostrar/ocultar filtros conforme a aba ativa
  function mostrarFiltros(ativo) {
    filtrosDiv.style.display = ativo ? '' : 'none';
    buscaTabela.style.display = ativo ? '' : 'none';
    exportarCsvBtn.style.display = ativo ? '' : 'none';
    output.innerHTML = ativo ? '' : '<p style="color:#888;">Selecione a aba "Filtrar" para visualizar por período.</p>';
  }

  // Menu de navegação
  document.querySelectorAll('nav button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const aba = btn.dataset.section;
      const content = document.getElementById('content');
      if (content) {
        content.classList.remove('fade-in');
        void content.offsetWidth;
        content.classList.add('fade-in');
      }
      // Só mostra filtros e tabela se aba for "filtrar"
      mostrarFiltros(aba === 'filtrar');
      if (aba === 'filtrar') {
        renderTabela(filtroPeriodo.value, filtroPeriodo.value === 'mes' ? filtroMes.value : null);
      }
    });
  });

  // Extrai todos os meses disponíveis nos dados
  function getMesesDisponiveis(dados) {
    const meses = new Set();
    dados.forEach(item => {
      const data = new Date(item.data);
      if (!isNaN(data)) {
        meses.add(`${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`);
      }
    });
    // Ordena do mais recente para o mais antigo
    return Array.from(meses).sort((a, b) => b.localeCompare(a));
  }

  // Filtra linhas conforme o período e mês selecionado
  function filtrarPorPeriodo(linhas, tipo, mesSelecionado) {
    const agora = new Date();

    return linhas.filter(item => {
      const data = new Date(item.dia);
      if (isNaN(data)) return false;

      if (tipo === 'dia') {
        return (
          data.getDate() === agora.getDate() &&
          data.getMonth() === agora.getMonth() &&
          data.getFullYear() === agora.getFullYear()
        );
      }

      if (tipo === 'semana') {
        const inicioSemana = new Date(agora);
        inicioSemana.setDate(agora.getDate() - agora.getDay());
        inicioSemana.setHours(0, 0, 0, 0);
        const fimSemana = new Date(inicioSemana);
        fimSemana.setDate(inicioSemana.getDate() + 6);
        fimSemana.setHours(23, 59, 59, 999);
        return data >= inicioSemana && data <= fimSemana;
      }

      if (tipo === 'mes' && mesSelecionado) {
        const [anoFiltro, mesFiltro] = mesSelecionado.split('-');
        return (
          data.getFullYear() === parseInt(anoFiltro, 10) &&
          data.getMonth() + 1 === parseInt(mesFiltro, 10)
        );
      }

      return true;
    });
  }

  function slugify(text) {
    return text
      .toString()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
      .trim()
      .replace(/\s+/g, '_') // Espaços por underline
      .toLowerCase();
  }

  function renderTabelaComDados(linhas) {
    const output = document.getElementById('output');
    output.innerHTML = '';

    if (!linhas.length) {
      output.innerHTML = `<tr><td colspan="7" class="text-center text-gray-400 py-6">Nenhum resultado encontrado.</td></tr>`;
      return;
    }

    linhas.forEach(item => {
      const row = document.createElement('tr');
      row.className = 'transition-colors duration-150 hover:bg-primary-50 dark:hover:bg-gray-700';

      // Adiciona classes de prioridade
      if (item.prioridade === 'Alta') row.classList.add('priority-high');
      else if (item.prioridade === 'Média') row.classList.add('priority-medium');
      else if (item.prioridade === 'Baixa') row.classList.add('priority-low');

      row.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap">${formatarData(item.dia)}</td>
        <td class="px-6 py-4 whitespace-nowrap">${item.horario || ''}</td>
        <td class="px-6 py-4 whitespace-nowrap font-semibold">${item.materia || ''}</td>
        <td class="px-6 py-4">${item.conteudo || ''}</td>
        <td class="px-6 py-4 whitespace-nowrap">
          <select class="select-status px-2 py-1 text-xs rounded-full font-bold shadow ${getStatusClass(item.status)}" data-id="${item.id}">
        <option value="A Fazer" ${item.status === 'A Fazer' ? 'selected' : ''}>A Fazer</option>
        <option value="Em Progresso" ${item.status === 'Em Progresso' ? 'selected' : ''}>Em Progresso</option>
        <option value="Concluído" ${item.status === 'Concluído' ? 'selected' : ''}>Concluído</option>
          </select>
        </td>
        <td class="px-6 py-4 whitespace-nowrap font-bold capitalize">
          <select class="select-prioridade" data-id="${item.id}">
        <option value="Alta" ${item.prioridade === 'Alta' ? 'selected' : ''}>Alta</option>
        <option value="Média" ${item.prioridade === 'Média' ? 'selected' : ''}>Média</option>
        <option value="Baixa" ${item.prioridade === 'Baixa' ? 'selected' : ''}>Baixa</option>
          </select>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <button class="text-primary-600 hover:text-primary-900 dark:hover:text-primary-300 mr-2" onclick="editItem('${item.id}')">
        <i class="fas fa-edit"></i>
          </button>
          <button class="text-red-600 hover:text-red-900 dark:hover:text-red-300" onclick="deleteItem('${item.id}')">
        <i class="fas fa-trash"></i>
          </button>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          ${item.link ? `<a href="${item.link}" target="_blank" rel="noopener noreferrer">Link</a>` : ''}
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          ${item.link1 ? `<a href="${item.link1}" target="_blank" rel="noopener noreferrer">Link 1</a>` : ''}
        </td>
      `;
      output.appendChild(row);
        });
      }

      // Função auxiliar para status (adicione se não existir)
      function getStatusClass(status) {
        switch(status) {
      case 'A Fazer': return 'status-todo';
      case 'Em Progresso': return 'status-progress';
      case 'Concluído': return 'status-done';
      default: return 'bg-gray-100 dark:bg-gray-700';
        }
      }

  async function renderTabela(periodo = filtroPeriodo.value, mesSelecionado = filtroPeriodo.value === 'mes' ? filtroMes.value : null) {
    loading.style.display = '';
    let linhas = await getHorarios();

    // Filtros avançados
    if (filtroStatus.value) {
      linhas = linhas.filter(l => l.status === filtroStatus.value);
    }
    if (filtroPrioridade.value) {
      linhas = linhas.filter(l => l.prioridade === filtroPrioridade.value);
    }

    // AQUI: filtro por período
    linhas = filtrarPorPeriodo(linhas, periodo, mesSelecionado);

    renderTabelaComDados(linhas);

    document.querySelectorAll('.btn-ver-conteudo').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = this.getAttribute('data-id');
        if (id) mostrarConteudo(id);
        else alert('Nenhum conteúdo vinculado a este estudo.');
      });
    });

    loading.style.display = 'none';

    // Atualizar STATUS
    document.querySelectorAll('.select-status').forEach(sel => {
      sel.addEventListener('change', async function() {
        await fetch(`/api/horarios/${this.dataset.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: this.value })
        });
        mostrarModalConfirmacao('Status atualizado!');
        renderTabela(); // Atualiza a tabela após salvar
      });
    });

    // Atualizar PRIORIDADE
    document.querySelectorAll('.select-prioridade').forEach(sel => {
      sel.addEventListener('change', async function() {
        await fetch(`/api/horarios/${this.dataset.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prioridade: this.value })
        });
        mostrarModalConfirmacao('Prioridade atualizada!');
        renderTabela(); // Atualiza a tabela após salvar
      });
    });

    // Adiciona botão para fechar o toast manualmente
    const toast = document.getElementById('toast');
    if (toast && !toast.querySelector('.toast-close')) {
      const btn = document.createElement('button');
      btn.textContent = '×';
      btn.className = 'toast-close';
      btn.style.cssText = 'background:none;border:none;font-size:1.2em;position:absolute;top:4px;right:8px;cursor:pointer;';
      btn.onclick = () => { toast.className = 'toast'; };
      toast.appendChild(btn);
    }

    // Após renderizar a tabela:
    const ctx = document.getElementById('grafico').getContext('2d');
    const statusCount = contarStatus(linhas);

    const total = Object.values(statusCount).reduce((a, b) => a + b, 0);
    const eficiencia = total ? Math.round((statusCount['Concluído'] / total) * 100) : 0;
    atualizarCardConcluidos(statusCount['Concluído'], eficiencia);

    if (window.graficoStatus) window.graficoStatus.destroy();
    window.graficoStatus = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(statusCount),
        datasets: [{
          data: Object.values(statusCount),
          backgroundColor: ['#fbc02d', '#1976d2', '#388e3c']
        }]
      },
      options: {
        plugins: { legend: { position: 'bottom' } },
        cutout: '70%'
      }
    });
  }

  async function renderizarCartoes() {
    const cardView = document.getElementById('card-view');
    const buscaTabela = document.getElementById('busca-tabela');
    const filtroPeriodo = document.getElementById('filtro-periodo');
    const filtroMes = document.getElementById('filtro-mes');
    const filtroStatus = document.getElementById('filtro-status');
    const filtroPrioridade = document.getElementById('filtro-prioridade');
    const loading = document.getElementById('loading');

    cardView.innerHTML = '';
    loading.style.display = '';

    let dados = await getHorarios();

    // Filtros
    if (filtroStatus && filtroStatus.value) {
      dados = dados.filter(l => l.status === filtroStatus.value);
    }
    if (filtroPrioridade && filtroPrioridade.value) {
      dados = dados.filter(l => l.prioridade === filtroPrioridade.value);
    }
    if (filtroPeriodo && filtroPeriodo.value) {
      dados = filtrarPorPeriodo(dados, filtroPeriodo.value, filtroPeriodo.value === 'mes' ? filtroMes.value : null);
    }
    // Busca
    if (buscaTabela && buscaTabela.value.trim()) {
      const termo = buscaTabela.value.trim().toLowerCase();
      dados = dados.filter(item =>
        Object.values(item).some(cell => (cell + '').toLowerCase().includes(termo))
      );
    }

    if (!dados.length) {
      cardView.innerHTML = `<div class="text-center text-gray-400 py-6">Nenhum resultado encontrado.</div>`;
      loading.style.display = 'none';
      return;
    }

    dados.forEach(item => {
      const card = document.createElement('div');
      card.className = 'bg-white dark:bg-gray-800 rounded-lg shadow p-4 animate-fade-in card-hover border-l-4 mb-2 ' +
        (item.prioridade === 'Alta' ? 'priority-high' : item.prioridade === 'Média' ? 'priority-medium' : 'priority-low');
      card.innerHTML = `
        <div class="flex justify-between items-center mb-2">
          <span class="font-semibold text-primary-600 dark:text-primary-400">${item.materia || ''}</span>
          <span class="text-xs px-2 py-1 rounded ${item.status === 'Concluído' ? 'status-done' : item.status === 'Em Progresso' ? 'status-progress' : 'status-todo'}">${item.status || ''}</span>
        </div>
        <div class="text-sm text-gray-700 dark:text-gray-300 mb-1"><b>Conteúdo:</b> ${item.conteudo || ''}</div>
        <div class="text-xs text-gray-500 dark:text-gray-400 mb-1"><b>Dia:</b> ${formatarData(item.dia)} <b>Horário:</b> ${item.horario || ''}</div>
        <div class="flex space-x-2 mt-2">
          <button class="text-blue-600 hover:underline" onclick="editItem('${item.id}')"><i class="fas fa-edit"></i></button>
          <button class="text-red-600 hover:underline" onclick="deleteItem('${item.id}')"><i class="fas fa-trash"></i></button>
        </div>
        ${item.link ? `<div class="mt-2"><a href="${item.link}" target="_blank" class="text-primary-600 underline">Link</a></div>` : ''}
        ${item.link1 ? `<div class="mt-2"><a href="${item.link1}" target="_blank" class="text-primary-600 underline">Link 1</a></div>` : ''}
      `;
      cardView.appendChild(card);
    });

    loading.style.display = 'none';
  }

  // Atualiza o filtro de meses e exibe o menu apenas quando "mes" está selecionado
  function atualizarFiltroMes() {
    // Meses de maio (5) a novembro (11) de 2025
    const mesesFixos = [
      { value: '2025-05', label: 'Maio / 2025' },
      { value: '2025-06', label: 'Junho / 2025' },
      { value: '2025-07', label: 'Julho / 2025' },
      { value: '2025-08', label: 'Agosto / 2025' },
      { value: '2025-09', label: 'Setembro / 2025' },
      { value: '2025-10', label: 'Outubro / 2025' },
      { value: '2025-11', label: 'Novembro / 2025' }
    ];
    filtroMes.innerHTML = '';
    mesesFixos.forEach(m => {
      filtroMes.innerHTML += `<option value="${m.value}">${m.label}</option>`;
    });
    filtroMes.style.display = '';
    // Sempre renderiza o primeiro mês disponível ao trocar para "mes"
    filtroMes.value = mesesFixos[0].value;
    renderTabela('mes', filtroMes.value);
  }

  function atualizarInfo() {
    if (filtroPeriodo.value === 'mes') {
      filtrosInfo.textContent = 'Selecione o mês desejado para visualizar os dados.';
    } else if (filtroPeriodo.value === 'semana') {
      filtrosInfo.textContent = 'Exibindo apenas os dados da semana atual.';
    } else if (filtroPeriodo.value === 'dia') {
      filtrosInfo.textContent = 'Exibindo apenas os dados do dia atual.';
    } else {
      filtrosInfo.textContent = '';
    }
  }

  if (filtroPeriodo && filtroMes) {
    filtroPeriodo.addEventListener('change', () => {
      if (filtroPeriodo.value === 'mes') {
        atualizarFiltroMes();
        filtroMes.style.display = '';
        renderTabela('mes', filtroMes.value);
      } else {
        filtroMes.style.display = 'none';
        renderTabela(filtroPeriodo.value);
      }
      atualizarInfo();
    });

    filtroMes.addEventListener('change', () => {
      renderTabela('mes', filtroMes.value);
      atualizarInfo();
    });
  }

  atualizarInfo();

  // Inicializa: mostra filtros só se a aba "Filtrar" estiver ativa
  mostrarFiltros(false);

  // Função para exportar os dados filtrados para CSV
  async function exportarTabelaParaCSV() {
    let csv = '';
    let linhas = await getHorarios();
    if (!linhas || linhas.error) {
      alert(linhas ? linhas.error : 'Erro ao carregar dados');
      return;
    }
    if (filtroPeriodo.value === 'mes') {
      linhas = filtrarPorPeriodo(linhas, 'mes', filtroMes.value);
    } else if (filtroPeriodo.value === 'semana') {
      linhas = filtrarPorPeriodo(linhas, 'semana');
    } else if (filtroPeriodo.value === 'dia') {
      linhas = filtrarPorPeriodo(linhas, 'dia');
    }
    // Cabeçalho
    csv += 'ID;Dia;Horário;Matéria;Conteúdo;Status;Prioridade;Link;Vídeos\n';
    // Linhas
    linhas.forEach(item => {
      csv += `"${item.id}";"${formatarData(item.dia) || ''}";"${item.horario || ''}";"${item.materia || ''}";"${item.conteudo || ''}";"${item.status}";"${item.prioridade}";"${item.link || ''}";"${item.videos || ''}"\n`;
    });
    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dados_filtrados.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  if (exportarCsvBtn) {
    exportarCsvBtn.addEventListener('click', exportarTabelaParaCSV);
  }

  if (btnCartao && btnTabela) {
    btnCartao.addEventListener('click', () => {
      document.getElementById('tabela-estudos').style.display = 'none';
      document.getElementById('card-view').style.display = 'grid';
      document.getElementById('modo-cartao').style.display = 'none';
      document.getElementById('modo-tabela').style.display = 'inline-flex';
      renderizarCartoes();
    });

    btnTabela.addEventListener('click', () => {
      document.getElementById('tabela-estudos').style.display = 'block';
      document.getElementById('card-view').style.display = 'none';
      document.getElementById('modo-cartao').style.display = 'inline-flex';
      document.getElementById('modo-tabela').style.display = 'none';
    });
  }

  if (btnNovoEstudo && modalEstudo && fecharModal && formEstudo) {
    btnNovoEstudo.addEventListener('click', () => {
      formEstudo.reset();
      document.getElementById('modal-titulo').textContent = 'Novo Estudo';
      modalEstudo.style.display = 'block';
    });

    fecharModal.addEventListener('click', () => {
      modalEstudo.style.display = 'none';
    });

    // Fecha o modal ao clicar fora dele
    window.addEventListener('click', (event) => {
      if (event.target === modalEstudo) {
        modalEstudo.style.display = 'none';
      }
    });
  }

  formEstudo.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(formEstudo);
    // Adicione os outros campos como JSON
    const dados = {};
    formEstudo.querySelectorAll('input, select, textarea').forEach(el => {
      if (el.type !== 'file') dados[el.name] = el.value;
    });
    formData.append('dados', JSON.stringify(dados));
    const res = await fetch('/api/horarios', {
      method: 'POST',
      body: formData
    });
    const result = await res.json();
    // ...feedback e atualização...
  });

  document.getElementById('novo-estudo').addEventListener('click', () => {
    // Limpa e mostra o modal para novo estudo
    abrirModalEstudo();
  });

  function abrirModalEstudo(estudo = null) {
    formEstudo.reset();
    if (estudo) {
      Object.entries(estudo).forEach(([k, v]) => {
        if (formEstudo.elements[k]) formEstudo.elements[k].value = v;
      });
      formEstudo.dataset.editando = estudo.id;
      document.getElementById('modal-titulo').textContent = 'Editar Estudo';
    } else {
      document.getElementById('modal-titulo').textContent = 'Novo Estudo';
      delete formEstudo.dataset.editando;
    }
    modalEstudo.style.display = 'block';
  }

  document.getElementById('form-estudo').addEventListener('submit', (e) => {
    e.preventDefault();
    // Coleta dados do formulário e envia para o backend (novoEstudo ou editarEstudo)
    // Fecha o modal e recarrega a tabela
  });

  document.getElementById('toggle-dark').onclick = () => {
    document.body.classList.toggle('dark-mode');
  };

  // Atualize a tabela ao mudar filtros
  [filtroStatus, filtroPrioridade].forEach(filtro => {
    filtro.addEventListener('change', () => renderTabela());
  });

  document.getElementById('btn-estudos').addEventListener('click', () => {
    // Esconde todos os conteúdos principais, se houver outros
    document.querySelectorAll('.table-responsive').forEach(div => div.style.display = 'none');
    // Mostra só a tabela de estudos
    document.getElementById('tabela-estudos').style.display = '';
    // (Opcional) Atualiza a tabela
    renderTabela();
  });

  async function mostrarConteudo(id) {
    const res = await fetch(`/api/conteudos/${id}`);
    if (!res.ok) {
      alert('Conteúdo não encontrado!');
      return;
    }
    const conteudo = await res.json();
    document.getElementById('conteudo-titulo').textContent = conteudo.titulo;
    document.getElementById('conteudo-html').innerHTML = conteudo.conteudo_html;
    document.getElementById('pagina-conteudo').style.display = '';
    document.getElementById('tabela-estudos').style.display = 'none';
  }

  function voltarParaEstudos() {
    document.getElementById('pagina-conteudo').style.display = 'none';
    document.getElementById('tabela-estudos').style.display = '';
  }

  // Mostrar o formulário ao clicar no botão
  document.getElementById('novo-conteudo').onclick = () => {
    document.getElementById('form-conteudo').style.display = '';
  };

  // Enviar o formulário para o backend
  document.getElementById('conteudo-form').onsubmit = async function(e) {
    e.preventDefault();
    const form = e.target;
    const dados = {
      titulo: form.titulo.value,
      materia: form.materia.value,
      conteudo_html: form.conteudo_html.value
    };
    const res = await fetch('/api/conteudos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });
    if (res.ok) {
      alert('Conteúdo cadastrado com sucesso!');
      form.reset();
      document.getElementById('form-conteudo').style.display = 'none';
      // (Opcional) Atualize a lista de conteúdos, se houver
    } else {
      alert('Erro ao cadastrar conteúdo.');
    }
  };

  if (buscaTabela) {
    buscaTabela.addEventListener('input', async function() {
      const termo = this.value.trim();
      if (!termo) {
        renderTabela(); // Mostra todos se o campo estiver vazio
        return;
      }
      const res = await fetch(`/api/horarios/busca?termo=${encodeURIComponent(termo)}`);
      const dados = await res.json();
      console.log('Dados filtrados:', dados);
      renderTabelaComDados(dados); // Exibe só o resultado da busca
    });
  }

  atualizarCards();
});
