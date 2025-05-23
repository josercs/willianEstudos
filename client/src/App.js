import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import TabelaHorarios from './components/TabelaHorarios';
import CardsEstatisticas from './components/CardsEstatisticas';
import './App.css';

// Header minimalista, só barra no topo
function Header() {
  return (
    <header className="header-minimal">
      <span className="header-logo">StudyFlow</span>
    </header>
  );
}

function Home() {
  return (
    <div className="home-container">
      <div className="home-hero">
        <i className="fas fa-bolt home-hero-icon"></i>
        <h2 className="home-title">
          Bem-vindo ao <span className="home-title-highlight">StudyFlow</span>!
        </h2>
        <span className="home-beta">Aprenda, evolua, conquiste!</span>
        <p className="home-desc">
          Organize seus estudos, acompanhe seu progresso e turbine sua rotina escolar de um jeito moderno e divertido!
        </p>
        <div className="home-actions">
          <span className="home-tip">
            <i className="fas fa-arrow-left"></i> Use o menu ao lado para começar 🚀
          </span>
        </div>
      </div>
      <div className="home-features">
        <div className="home-feature-card">
          <i className="fas fa-calendar-check"></i>
          <span>Horários inteligentes</span>
        </div>
        <div className="home-feature-card">
          <i className="fas fa-chart-line"></i>
          <span>Estatísticas visuais</span>
        </div>
        <div className="home-feature-card">
          <i className="fas fa-trophy"></i>
          <span>Metas e conquistas</span>
        </div>
      </div>
    </div>
  );
}

function ConfigComponent() {
  return (
    <div>
      <h2>Configurações</h2>
      <p>Em breve você poderá ajustar suas preferências aqui.</p>
    </div>
  );
}

function App() {
  const [pagina, setPagina] = useState('home');

  return (
    <div className="app-layout">
      <Sidebar onSelecionar={setPagina} paginaAtiva={pagina} />
      <div className="main-content">
        <Header />
        {pagina === 'home' && <Home />}
        {pagina === 'horarios' && (
          <>
            <h2 className="titulo-horarios">Horários Escolares</h2>
            <TabelaHorarios />
          </>
        )}
        {pagina === 'estatisticas' && <CardsEstatisticas />}
        {pagina === 'configuracoes' && <ConfigComponent />}
      </div>
    </div>
  );
}

export default App;
