// server-refatorado.js
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import client from './db/connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const upload = multer();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/pdfs', express.static(path.join(__dirname, 'pdfs')));

// Servir arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, '../public')));

// Rota para servir index.html na raiz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// API: Buscar todos os horários
app.get('/api/horarios', async (req, res) => {
  const { rows } = await client.query('SELECT * FROM horarios_escolares ORDER BY id');
  res.json(rows);
});

// API: Buscar horário por ID
app.get('/api/horarios/:id', async (req, res) => {
  const { id } = req.params;
  const { rows } = await client.query('SELECT * FROM horarios_escolares WHERE id = $1', [id]);
  if (rows.length) res.json(rows[0]);
  else res.status(404).json({ error: 'Registro não encontrado' });
});

// API: Criar novo horário
app.post('/api/horarios', upload.single('pdf'), async (req, res) => {
  const dados = JSON.parse(req.body.dados);
  const pdfBuffer = req.file ? req.file.buffer : null;
  const pdfNome = req.file ? req.file.originalname : null;
  try {
    await client.query(
      `INSERT INTO horarios_escolares 
        (dia, horario, materia, conteudo, status, prioridade, link, videos, anotacoes, pdf, pdf_nome)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        dados.dia,
        dados.horario,
        dados.materia,
        dados.conteudo,
        dados.status,
        dados.prioridade,
        dados.link,
        dados.videos,
        dados.anotacoes,
        pdfBuffer,
        pdfNome
      ]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Atualizar horário
app.put('/api/horarios/:id', async (req, res) => {
  const { id } = req.params;
  const campos = Object.entries(req.body);
  if (!campos.length) return res.status(400).json({ success: false, error: 'Nada para atualizar' });

  const sets = campos.map(([chave], i) => `${chave} = $${i + 1}`).join(', ');
  const valores = campos.map(([, valor]) => valor);

  try {
    await client.query(`UPDATE horarios_escolares SET ${sets} WHERE id = $${valores.length + 1}`, [...valores, id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Excluir horário
app.delete('/api/horarios/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await client.query('DELETE FROM horarios_escolares WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Estatísticas
app.get('/api/estatisticas', async (req, res) => {
  try {
    const { rows } = await client.query('SELECT * FROM horarios_escolares');
    const hoje = new Date().toISOString().slice(0, 10);
    const ontem = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    let estudosHoje = 0, estudosOntem = 0, concluidos = 0, tempoEstudado = 0;

    for (const h of rows) {
      const status = (h.status || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
      const diaStr = h.dia ? String(h.dia).slice(0, 10) : '';
      if (diaStr === hoje && h.horario) estudosHoje++;
      if (diaStr === ontem && h.horario) estudosOntem++;
      if (status === 'concluido') concluidos++;
    }

    const eficiencia = rows.length ? Math.round((concluidos / rows.length) * 100) : 0;

    res.json({
      estudosHoje,
      estudosOntem,
      concluidos,
      eficiencia,
      tempoEstudado // ou 0 se não tiver coluna de duração
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Gráfico de estudos
app.get('/api/grafico-estudos', async (req, res) => {
  try {
    const { rows } = await client.query(`
      SELECT 
        to_char(dia, 'YYYY-MM-DD') as dia,
        COUNT(*) as total
      FROM horarios_escolares
      WHERE dia >= CURRENT_DATE - INTERVAL '6 days'
      GROUP BY dia
      ORDER BY dia
    `);

    // Garante todos os dias dos últimos 7 dias, mesmo se não houver estudos
    const dias = [];
    const valores = [];
    for (let i = 6; i >= 0; i--) {
      const data = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const diaStr = data.toISOString().slice(0, 10);
      dias.push(diaStr);
      const row = rows.find(r => r.dia === diaStr);
      valores.push(row ? Number(row.total) : 0);
    }

    res.json({ labels: dias, valores });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Gráfico de status
app.get('/api/grafico-status', async (req, res) => {
  try {
    const { rows } = await client.query(`
      SELECT status, COUNT(*) as total
      FROM horarios_escolares
      GROUP BY status
    `);

    const statusLabels = ['A Fazer', 'Em Andamento', 'Concluído'];
    const valores = statusLabels.map(label => {
      const row = rows.find(r => (r.status || '').toLowerCase() === label.toLowerCase());
      return row ? Number(row.total) : 0;
    });
    res.json({ labels: statusLabels, valores });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Iniciar servidor
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
