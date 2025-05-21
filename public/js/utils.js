// utils.js

export function normalizarStatus(status) {
  return (status || '').trim().normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export function formatarData(dia) {
  if (!dia) return '';
  const data = new Date(dia);
  if (isNaN(data)) return dia;
  const dias = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  return `${data.getDate()} ${meses[data.getMonth()]} (${dias[data.getDay()]})`;
}

export function slugify(text) {
  return text
    .toString()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .toLowerCase();
}
export function formatarTempo(duracaoMinutos) {
  if (duracaoMinutos === undefined || duracaoMinutos === null) return '';
  const horas = Math.floor(duracaoMinutos / 60);
  const minutos = duracaoMinutos % 60;
  return `${horas}h ${minutos}m`;
}
