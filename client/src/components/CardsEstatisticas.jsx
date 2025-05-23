import React, { useEffect, useState } from 'react';
import { formatarTempo } from '../utils';

function CardsEstatisticas() {
  const [stats, setStats] = useState({ concluidos: 0, eficiencia: 0, tempoEstudado: 0 });

  useEffect(() => {
    fetch('/api/estatisticas')
      .then(res => res.json())
      .then(setStats)
      .catch(() => setStats({ concluidos: 0, eficiencia: 0, tempoEstudado: 0 }));
  }, []);

  return (
    <div className="cards-estatisticas">
      <div className="card-estudo card-blue">
        <span className="card-icon">
          <i className="fas fa-calendar-day"></i>
        </span>
        <p className="card-label">Estudos hoje</p>
        <h3 className="card-value">0</h3>
      </div>
      <div className="card-estudo card-green">
        <span className="card-icon">
          <i className="fas fa-check-circle"></i>
        </span>
        <p className="card-label">Concluídos</p>
        <h3 className="card-value">{stats.concluidos}</h3>
        <p className="card-info">{stats.eficiencia}% de eficiência</p>
      </div>
      <div className="card-estudo card-purple">
        <span className="card-icon">
          <i className="fas fa-clock"></i>
        </span>
        <p className="card-label">Tempo estudado</p>
        <h3 className="card-value">{formatarTempo(stats.tempoEstudado)}</h3>
        <p className="card-info">Meta: 10h semanais</p>
      </div>
    </div>
  );
}

export default CardsEstatisticas;