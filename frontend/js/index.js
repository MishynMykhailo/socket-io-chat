const socket = io();
const messages = document.getElementById("messages");
const input = document.getElementById("input");
const usernameInput = document.getElementById("username");
const setUsernameButton = document.getElementById("set-username");

let username = ""; // Имя пользователя

function getCurrentTime() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0"); // Получаем часы и добавляем нули при необходимости
  const minutes = now.getMinutes().toString().padStart(2, "0"); // Получаем минуты и добавляем нули при необходимости
  const seconds = now.getSeconds().toString().padStart(2, "0"); // Получаем секунды и добавляем нули при необходимости

  return `${hours}:${minutes}:${seconds}`;
}

// Функция для добавления сообщения в чат и прокрутки вниз
function addMessageAndScrollToBottom(message) {
  const li = document.createElement("li");
  const pUser = document.createElement("p");
  const pMsg = document.createElement("p");
  const timestamp = document.createElement("p");

  const { user, msg } = message;
  if (user == undefined || msg == undefined) {
    return;
  }
  li.classList.add("fade-in");
  li.classList.add("item");
  pUser.classList.add("item__userName");
  pUser.innerText = `${user}:`;
  pMsg.innerText = msg;
  timestamp.classList.add("item__time");
  timestamp.innerText = getCurrentTime();
  messages.appendChild(li);
  li.appendChild(pUser);
  li.appendChild(pMsg);
  li.appendChild(timestamp);

  setTimeout(() => {
    li.style.opacity = 1;
    li.style.transform = "translateY(0)";
  }, 10);
  // Прокрутите список сообщений до последнего сообщения
  messages.scrollTop = messages.scrollHeight;
}
function handlerUsersOnline(usersOnline) {
  const list = document.querySelector(".users__list");
  list.innerText = "";
  if (usersOnline) {
    for (const user in usersOnline) {
      const li = document.createElement("li");
      const pStatus = document.createElement("p");
      const pUser = document.createElement("p");
      li.classList.add("user__item");
      pStatus.classList.add("user__item-online");
      pUser.classList.add("user__item-name");
      pUser.innerText = usersOnline[user];
      li.appendChild(pStatus);
      li.appendChild(pUser);
      list.appendChild(li);
    }
  }
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
    input.focus(); // Установите фокус обратно на поле ввода после отправки сообщения
  }
});

// Обработчик получения сообщений от сервера и отображения их
socket.on("message", (msg) => {
  addMessageAndScrollToBottom(msg);
});
socket.on("usersOnline", (users) => handlerUsersOnline(users));
// Обработчик отключения от сервера
socket.on("disconnect", () => {
  addMessageAndScrollToBottom("You have been disconnected");
});

// Обработчик повторного подключения к серверу
socket.on("reconnect", () => {
  if (username) {
    addMessageAndScrollToBottom("You have been reconnected");
    socket.emit("set username", username);
  }
});

// Обработчик ошибок
socket.on("error", (error) => {
  addMessage(`An error occurred: ${error}`);
});
