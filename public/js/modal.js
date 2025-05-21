// modal.js

export function mostrarModalConfirmacao(msg, tempo = 2000) {
  const modal = document.getElementById('modal-confirmacao');
  const msgDiv = document.getElementById('modal-confirmacao-msg');
  msgDiv.textContent = msg;
  modal.style.display = 'flex';

  setTimeout(() => {
    modal.style.display = 'none';
  }, tempo);

  const fechar = document.getElementById('fechar-modal-confirmacao');
  if (fechar) {
    fechar.onclick = () => {
      modal.style.display = 'none';
    };
  }
}
