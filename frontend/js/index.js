const socket = io();
const messages = document.getElementById("messages");
const input = document.getElementById("input");
const usernameInput = document.getElementById("username");
const setUsernameButton = document.getElementById("set-username");

let username = ""; // Имя пользователя

// Функция для добавления сообщения в чат
function addMessage(message) {
  const li = document.createElement("li");

  // Проверяем, содержит ли сообщение имя пользователя
  if (message.includes(username)) {
    const parts = message.split(username);
    li.innerHTML = parts
      .map((part, index) => {
        if (index % 2 === 0) {
          return part; // Нет имени пользователя, оставляем как есть
        } else {
          return `<strong>${username}</strong>${part}`; // Выделяем имя пользователя жирным
        }
      })
      .join("");
  } else {
    li.textContent = message;
  }

  messages.appendChild(li);
}


// Обработчик нажатия кнопки "Set Username"
setUsernameButton.addEventListener("click", () => {
  const newUsername = usernameInput.value.trim();
  if (newUsername !== "") {
    username = newUsername;
    socket.emit("set username", username);
    usernameInput.disabled = true;
    setUsernameButton.disabled = true;
  }
});

// Обработчик отправки сообщения
document.querySelector("form").addEventListener("submit", (e) => {
  e.preventDefault();
  if (input.value) {
    socket.emit("chat message", input.value);
    input.value = "";
  }
});

// Обработчик получения сообщений от сервера и отображения их
socket.on("message", (msg) => {
  addMessage(msg);
});

// Обработчик отключения от сервера
socket.on("disconnect", () => {
  addMessage("You have been disconnected");
});

// Обработчик повторного подключения к серверу
socket.on("reconnect", () => {
  if (username) {
    addMessage("You have been reconnected");
    socket.emit("set username", username);
  }
});

// Обработчик ошибок
socket.on("error", (error) => {
  addMessage(`An error occurred: ${error}`);
});
