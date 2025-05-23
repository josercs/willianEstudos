import React, { useEffect, useState } from 'react';

// Funções utilitárias
function formatarData(dia) {
  if (!dia) return '';
  const data = new Date(dia);
  if (isNaN(data)) return dia;
  const dias = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  return `${data.getDate()} ${meses[data.getMonth()]} (${dias[data.getDay()]})`;
}

function paginar(dados, pagina = 1, itensPorPagina = 10) {
  const inicio = (pagina - 1) * itensPorPagina;
  return dados.slice(inicio, inicio + itensPorPagina);
}

function exportarCSV(horarios) {
  let csv = 'Dia,Horário,Matéria,Conteúdo,Status,Prioridade\n';
  horarios.forEach(h => {
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
}

function semanaISO(date) {
  const data = new Date(date);
  const ano = data.getFullYear();
  const primeiraQuinta = new Date(data.setDate(data.getDate() + 4 - (data.getDay() || 7)));
  const semanaISO = Math.ceil((((primeiraQuinta - new Date(primeiraQuinta.getFullYear(),0,1)) / 86400000) + 1)/7);
  return `${ano}-W${String(semanaISO).padStart(2, '0')}`;
}

function TabelaHorarios() {
  const [horarios, setHorarios] = useState([]);
  const [horariosFiltrados, setHorariosFiltrados] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');
  const [filtros, setFiltros] = useState({
    dia: '',
    mes: '',
    semana: '',
    materia: ''
  });

  const itensPorPagina = 10;

  useEffect(() => {
    setLoading(true);
    fetch('/api/horarios')
      .then(res => res.json())
      .then(data => {
        setHorarios(data);
        setLoading(false);
      })
      .catch(() => {
        setErro('Erro ao carregar horários');
        setLoading(false);
      });
  }, []);

  // Filtros e busca
  useEffect(() => {
    let filtrados = horarios;

    if (filtros.dia) {
      filtrados = filtrados.filter(h => (h.dia || '').slice(0, 10) === filtros.dia);
    }
    if (filtros.mes) {
      filtrados = filtrados.filter(h => (h.dia || '').slice(0, 7) === filtros.mes);
    }
    if (filtros.semana) {
      filtrados = filtrados.filter(h => {
        if (!h.dia) return false;
        return semanaISO(h.dia) === filtros.semana;
      });
    }
    if (filtros.materia) {
      filtrados = filtrados.filter(h => (h.materia || '').toLowerCase().includes(filtros.materia.toLowerCase()));
    }
    if (busca) {
      const termo = busca.toLowerCase();
      filtrados = filtrados.filter(h =>
        (h.materia || '').toLowerCase().includes(termo) ||
        (h.conteudo || '').toLowerCase().includes(termo)
      );
    }
    setPaginaAtual(1);
    setHorariosFiltrados(filtrados);
  }, [horarios, filtros, busca]);

  // Paginação
  const linhasPaginadas = paginar(horariosFiltrados, paginaAtual, itensPorPagina);
  const totalPaginas = Math.ceil(horariosFiltrados.length / itensPorPagina);

  // Edição de status/prioridade
  async function editarEstudo(id, dados) {
    await fetch(`/api/horarios/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });
    setHorarios(horarios =>
      horarios.map(h => h.id === id ? { ...h, ...dados } : h)
    );
  }

  if (loading) return <div className="tabela-loading">Carregando...</div>;
  if (erro) return <div className="tabela-erro">{erro}</div>;

  return (
    <div>
      <div className="filtros-container">
        <div>
          <label className="filtro-label">Dia</label>
          <input
            type="date"
            value={filtros.dia}
            onChange={e => setFiltros(f => ({ ...f, dia: e.target.value }))}
            className="filtro-input"
          />
        </div>
        <div>
          <label className="filtro-label">Mês</label>
          <input
            type="month"
            value={filtros.mes}
            onChange={e => setFiltros(f => ({ ...f, mes: e.target.value }))}
            className="filtro-input"
          />
        </div>
        <div>
          <label className="filtro-label">Semana</label>
          <input
            type="text"
            value={filtros.semana}
            onChange={e => setFiltros(f => ({ ...f, semana: e.target.value }))}
            placeholder="YYYY-Wxx"
            className="filtro-input"
          />
        </div>
        <div>
          <label className="filtro-label">Matéria</label>
          <input
            type="text"
            value={filtros.materia}
            onChange={e => setFiltros(f => ({ ...f, materia: e.target.value }))}
            placeholder="Matéria"
            className="filtro-input"
          />
        </div>
        <button
          onClick={() => setFiltros({ dia: '', mes: '', semana: '', materia: '' })}
          className="filtro-btn"
        >
          Limpar
        </button>
        <div style={{ flex: 1 }} />
        <input
          type="text"
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar por matéria ou conteúdo..."
          className="busca-input"
        />
        <button
          onClick={() => exportarCSV(horariosFiltrados)}
          className="filtro-btn"
        >
          Exportar CSV
        </button>
      </div>
      <div className="tabela-container">
        <table className="tabela-estudos">
          <thead>
            <tr>
              <th>Dia</th>
              <th>Horário</th>
              <th>Matéria</th>
              <th>Conteúdo</th>
              <th>Status</th>
              <th>Prioridade</th>
              <th>Link</th>
              <th>Link1</th>
            </tr>
          </thead>
          <tbody>
            {linhasPaginadas.length === 0 ? (
              <tr>
                <td colSpan={8} className="tabela-vazio">Nenhum horário encontrado.</td>
              </tr>
            ) : linhasPaginadas.map((h, idx) => (
              <tr key={h.id} className={idx % 2 === 0 ? "linha-par" : "linha-impar"}>
                <td>{h.dia ? formatarData(h.dia) : ''}</td>
                <td>{h.horario || ''}</td>
                <td>{h.materia || ''}</td>
                <td>{h.conteudo || ''}</td>
                <td>
                  <select
                    value={h.status}
                    onChange={e => editarEstudo(h.id, { status: e.target.value })}
                    className="tabela-select"
                  >
                    <option value="A Fazer">A Fazer</option>
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Concluído">Concluído</option>
                  </select>
                </td>
                <td>
                  <select
                    value={h.prioridade}
                    onChange={e => editarEstudo(h.id, { prioridade: e.target.value })}
                    className="tabela-select"
                  >
                    <option value="Alta">Alta</option>
                    <option value="Média">Média</option>
                    <option value="Baixa">Baixa</option>
                  </select>
                </td>
                <td>
                  {h.link ? (
                    <a
                      href={h.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="tabela-link"
                    >
                      Link
                    </a>
                  ) : ''}
                </td>
                <td>
                  {h.link1 ? (
                    <a
                      href={h.link1}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="tabela-link"
                    >
                      Link1
                    </a>
                  ) : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="paginacao">
        {Array.from({ length: totalPaginas }, (_, i) => (
          <button
            key={i + 1}
            disabled={paginaAtual === i + 1}
            onClick={() => setPaginaAtual(i + 1)}
            className={`paginacao-btn${paginaAtual === i + 1 ? " active" : ""}`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export default TabelaHorarios;