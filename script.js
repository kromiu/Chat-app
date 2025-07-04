const socket = io();
const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (input.value) {
    socket.emit('chat message', input.value);
    input.value = '';
  }
});

socket.on('chat history', (history) => {
  history.forEach(msg => addMessage(msg.text));
});

socket.on('chat message', (msg) => {
  addMessage(msg.text);
});

function addMessage(msg) {
  const li = document.createElement('li');
  li.textContent = msg;
  messages.appendChild(li);
}
