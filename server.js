const express = require('express');
const cors = require('cors');
const { Client } = require('pg');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname))); // Serve arquivos estáticos (index.html, styles.css, renderer.js, etc)
app.use('/pdfs', express.static(path.join(__dirname, 'pdfs')));

const upload = multer();

const client = new Client({
  user: 'postgres',
  host: '192.168.0.108', // ou IP do servidor PostgreSQL
  database: 'Estudos',
  password: '1234',
  port: 5432,
});
client.connect();

// API: Buscar todos os horários
app.get('/api/horarios', async (req, res) => {
  const result = await client.query('SELECT * FROM horarios_escolares ORDER BY id');
  res.json(result.rows);
});

// API: Novo estudo
app.post('/api/horarios', upload.single('pdf'), async (req, res) => {
  const dados = JSON.parse(req.body.dados); // outros campos do formulário
  const pdfBuffer = req.file ? req.file.buffer : null;
  const pdfNome = req.file ? req.file.originalname : null;
  try {
    await client.query(
      `INSERT INTO horarios_escolares (dia, horario, materia, conteudo, status, prioridade, link, videos, anotacoes, pdf, pdf_nome)
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
  } catch (e) {
    res.json({ success: false, error: e.message });
  }
});

// Editar
app.put('/api/horarios/:id', async (req, res) => {
    const { id } = req.params;
    const campos = [];
    const valores = [];
    if (req.body.status !== undefined) {
        campos.push('status');
        valores.push(req.body.status);
    }
    if (req.body.prioridade !== undefined) {
        campos.push('prioridade');
        valores.push(req.body.prioridade);
    }
    if (req.body.feito !== undefined) {
        campos.push('feito');
        valores.push(req.body.feito);
    }
    if (!campos.length) return res.json({ success: false, error: 'Nada para atualizar' });

    const sets = campos.map((c, i) => `${c}=$${i + 1}`).join(', ');
    valores.push(id);
    try {
        await client.query(`UPDATE horarios_escolares SET ${sets} WHERE id=$${valores.length}`, valores);
        res.json({ success: true });
    } catch (e) {
        res.json({ success: false, error: e.message });
    }
});

// Excluir
app.delete('/api/horarios/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await client.query('DELETE FROM horarios_escolares WHERE id=$1', [id]);
    res.json({ success: true });
  } catch (e) {
    res.json({ success: false, error: e.message });
  }
});

// API: Obter PDF
app.get('/api/horarios/:id/pdf', async (req, res) => {
  const { id } = req.params;
  const result = await client.query('SELECT pdf, pdf_nome FROM horarios_escolares WHERE id=$1', [id]);
  if (result.rows.length && result.rows[0].pdf) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${result.rows[0].pdf_nome || 'arquivo.pdf'}"`);
    res.send(result.rows[0].pdf);
  } else {
    res.status(404).send('PDF não encontrado');
  }
});

// API: Buscar horários por matéria e conteúdo
app.get('/api/horarios/busca', async (req, res) => {
  const { termo } = req.query;
  let query = 'SELECT * FROM horarios_escolares WHERE 1=1';
  const params = [];
  if (termo) {
    params.push(`%${termo}%`);
    query += ` AND (materia ILIKE $${params.length} OR conteudo ILIKE $${params.length})`;
  }
  query += ' ORDER BY id ASC';
  const { rows } = await client.query(query, params);
  res.json(rows);
});

// Listar todos os conteúdos
app.get('/api/conteudos', async (req, res) => {
  const { rows } = await client.query('SELECT * FROM conteudos ORDER BY criado_em DESC');
  res.json(rows);
});

// Obter um conteúdo específico
app.get('/api/conteudos/:id', async (req, res) => {
  const { id } = req.params;
  const { rows } = await client.query('SELECT * FROM conteudos WHERE id=$1', [id]);
  res.json(rows[0]);
});

// Criar novo conteúdo
app.post('/api/conteudos', async (req, res) => {
  const { titulo, materia, conteudo_html } = req.body;
  await client.query(
    'INSERT INTO conteudos (titulo, materia, conteudo_html) VALUES ($1, $2, $3)',
    [titulo, materia, conteudo_html]
  );
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://192.168.0.108:${PORT}`);
});