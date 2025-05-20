const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuração do banco
const client = new Client({
  user: 'postgres',
  host: '192.168.0.108',
  database: 'Estudos',
  password: '1234',
  port: 5432,
});

async function importarPDF(id, nomeArquivo) {
  const pdfPath = path.join(__dirname, 'pdfs', nomeArquivo);
  if (!fs.existsSync(pdfPath)) {
    console.log(`Arquivo não encontrado: ${nomeArquivo}`);
    return;
  }
  const buffer = fs.readFileSync(pdfPath);
  await client.query(
    'UPDATE horarios_escolares SET pdf = $1, pdf_nome = $2 WHERE id = $3',
    [buffer, nomeArquivo, id]
  );
  console.log(`PDF ${nomeArquivo} importado para o registro ID ${id}`);
}

async function main() {
  await client.connect();

  // Edite este array com os IDs e nomes dos arquivos PDF correspondentes
  const pdfs = [
    { id: 1, nome: 'interpretacao de texto.pdf' },
    { id: 2, nome: 'aritmética.pdf' },
    // Adicione mais conforme necessário
  ];

  for (const { id, nome } of pdfs) {
    await importarPDF(id, nome);
  }

  await client.end();
  console.log('Importação finalizada!');
}

main().catch(e => {
  console.error(e);
  client.end();
});