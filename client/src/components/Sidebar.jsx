import React from 'react';

function Sidebar({ onSelecionar, paginaAtiva }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <i className="fas fa-book-open sidebar-logo"></i>
        <span className="sidebar-title">
          Study<span className="sidebar-title-light">Flow</span>
        </span>
      </div>
      <nav className="sidebar-nav">
        <a
          href="#"
          className={`sidebar-link${paginaAtiva === 'home' ? ' active' : ''}`}
          onClick={e => { e.preventDefault(); onSelecionar('home'); }}
        >
          <i className="fas fa-home"></i> Home
        </a>
        <a
          href="#"
          className={`sidebar-link${paginaAtiva === 'horarios' ? ' active' : ''}`}
          onClick={e => { e.preventDefault(); onSelecionar('horarios'); }}
        >
          <i className="fas fa-table"></i> Horários
        </a>
        <a
          href="#"
          className={`sidebar-link${paginaAtiva === 'estatisticas' ? ' active' : ''}`}
          onClick={e => { e.preventDefault(); onSelecionar('estatisticas'); }}
        >
          <i className="fas fa-chart-bar"></i> Estatísticas
        </a>
        <a
          href="#"
          className={`sidebar-link${paginaAtiva === 'configuracoes' ? ' active' : ''}`}
          onClick={e => { e.preventDefault(); onSelecionar('configuracoes'); }}
        >
          <i className="fas fa-cog"></i> Configurações
        </a>
      </nav>
      <div className="sidebar-footer">
        <button className="sidebar-btn sidebar-btn-light">
          <i className="fas fa-moon"></i>
          <span>Modo Escuro</span>
        </button>
        <button className="sidebar-btn sidebar-btn-blue">
          <i className="fas fa-plus"></i>
          Novo Estudo
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;