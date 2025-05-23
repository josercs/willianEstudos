import React, { useState } from 'react';

function ModalEstudo({ open, onClose, onSave, estudo }) {
  const [form, setForm] = useState(
    estudo || {
      dia: '',
      horario: '',
      materia: '',
      conteudo: '',
      status: 'A Fazer',
      prioridade: 'Média',
      link: '',
      link1: ''
    }
  );

  // Atualiza o formulário ao editar campos
  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  // Salva e fecha
  function handleSubmit(e) {
    e.preventDefault();
    onSave(form);
    onClose();
  }

  // Fecha ao clicar fora do modal
  function handleBackdrop(e) {
    if (e.target === e.currentTarget) onClose();
  }

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={handleBackdrop}>
      <div className="modal-estudo">
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h2 className="modal-title">{estudo ? 'Editar Estudo' : 'Novo Estudo'}</h2>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Dia</label>
              <input type="date" name="dia" value={form.dia} onChange={handleChange} className="border rounded px-2 py-1 w-full" required />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Horário</label>
              <input type="text" name="horario" value={form.horario} onChange={handleChange} className="border rounded px-2 py-1 w-full" placeholder="Ex: 14:00 - 15:00" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Matéria</label>
            <input type="text" name="materia" value={form.materia} onChange={handleChange} className="border rounded px-2 py-1 w-full" required />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Conteúdo</label>
            <input type="text" name="conteudo" value={form.conteudo} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="border rounded px-2 py-1 w-full">
                <option value="A Fazer">A Fazer</option>
                <option value="Em Andamento">Em Andamento</option>
                <option value="Concluído">Concluído</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Prioridade</label>
              <select name="prioridade" value={form.prioridade} onChange={handleChange} className="border rounded px-2 py-1 w-full">
                <option value="Alta">Alta</option>
                <option value="Média">Média</option>
                <option value="Baixa">Baixa</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Link</label>
            <input type="url" name="link" value={form.link} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Link1</label>
            <input type="url" name="link1" value={form.link1} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancelar">Cancelar</button>
            <button type="submit" className="btn-salvar">{estudo ? 'Salvar' : 'Adicionar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalEstudo;