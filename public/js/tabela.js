// tabela.js
import { formatarData, slugify } from './utils.js';
import { editarEstudo } from './api.js';


export function renderTabelaComDados(linhas) {
 

  const tbody = document.getElementById('output');
  if (!tbody) return;

  // Limpa o conteúdo anterior
  tbody.innerHTML = '';

  if (!linhas || linhas.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4">Nenhum horário encontrado.</td></tr>`;
    return;
  }

  for (const h of linhas) {
    const tr = document.createElement('tr');
    tr.className = "hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors";
    tr.innerHTML = `
      <td class="px-6 py-4">${h.dia ? formatarData(h.dia) : ''}</td>
      <td class="px-6 py-4">${h.horario || ''}</td>
      <td class="px-6 py-4">${h.materia || ''}</td>
      <td class="px-6 py-4">${h.conteudo || ''}</td>
      <td class="px-6 py-4">
        <select class="status-select rounded px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" data-id="${h.id}">
          <option value="A Fazer" ${h.status === 'A Fazer' ? 'selected' : ''}>A Fazer</option>
          <option value="Em Andamento" ${h.status === 'Em Andamento' ? 'selected' : ''}>Em Andamento</option>
          <option value="Concluído" ${h.status === 'Concluído' ? 'selected' : ''}>Concluído</option>
        </select>
      </td>
      <td class="px-6 py-4">
        <select class="prioridade-select rounded px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" data-id="${h.id}">
          <option value="Alta" ${h.prioridade === 'Alta' ? 'selected' : ''}>Alta</option>
          <option value="Média" ${h.prioridade === 'Média' ? 'selected' : ''}>Média</option>
          <option value="Baixa" ${h.prioridade === 'Baixa' ? 'selected' : ''}>Baixa</option>
        </select>
      </td>
      <td class="px-6 py-4">
        ${h.link ? `<a href="${h.link}" target="_blank" class="text-blue-600 underline hover:text-blue-800">Link</a>` : ''}
      </td>
      <td class="px-6 py-4">
        ${h.link1 ? `<a href="${h.link1}" target="_blank" class="text-blue-600 underline hover:text-blue-800">Link1</a>` : ''}
      </td>
    `;
    tbody.appendChild(tr);
  }

  // Após preencher a tabela:
  tbody.querySelectorAll('.status-select').forEach(select => {
    select.addEventListener('change', async function() {
      const id = this.dataset.id;
      const novoStatus = this.value;
      await editarEstudo(id, { status: novoStatus }); // função já existente no seu api.js
    });
  });

  tbody.querySelectorAll('.prioridade-select').forEach(select => {
    select.addEventListener('change', async function() {
      const id = this.dataset.id;
      const novaPrioridade = this.value;
      await editarEstudo(id, { prioridade: novaPrioridade }); // função já existente no seu api.js
    });
  });
}
