import React from 'react';

function Header() {
  return (
    <header className="header-app">
      <h1 className="header-title">
        <span role="img" aria-label="livro">📚</span> Bora dominar o seu futuro hoje?
      </h1>
      <span className="header-beta">StudyFlow — Aprenda, evolua, conquiste!</span>
      <div className="header-actions">
        <button className="btn-header btn-header-blue">
          <i className="fas fa-plus"></i>
          Novo Estudo
        </button>
        <button className="btn-header btn-header-green">
          <i className="fas fa-lightbulb"></i>
          Dica Rápida
        </button>
        <button className="btn-header btn-header-bell">
          <i className="fas fa-bell"></i>
          <span className="header-bell-dot"></span>
        </button>
      </div>
    </header>
  );
}

export default Header;