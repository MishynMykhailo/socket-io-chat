const socket = io();
const messages = document.getElementById("messages");
const input = document.getElementById("input");
const usernameInput = document.getElementById("username");
const setUsernameButton = document.getElementById("set-username");
const usersList = document.querySelector(".users__list");

let username = "";

function getCurrentTime() {
  const now = new Date();
  return now.toLocaleTimeString("en-US", { hour12: false });
}

function createMessageElement(message) {
  const li = document.createElement("li");
  const pUser = document.createElement("p");
  const pMsg = document.createElement("p");
  const timestamp = document.createElement("p");

  const { user, msg } = message;
  if (user === undefined || msg === undefined) {
    return null;
  }

  li.classList.add("fade-in", "item");
  pUser.classList.add("item__userName");
  pMsg.classList.add("item__text");
  timestamp.classList.add("item__time");

  pUser.innerText = `${user}:`;
  pMsg.innerText = msg;
  timestamp.innerText = getCurrentTime();

  li.appendChild(pUser);
  li.appendChild(pMsg);
  li.appendChild(timestamp);

  return li;
}

function addMessageAndScrollToBottom(message) {
  const messageElement = createMessageElement(message);
  if (messageElement) {
    messages.appendChild(messageElement);
    setTimeout(() => {
      messageElement.style.opacity = 1;
      messageElement.style.transform = "translateY(0)";
    }, 10);
    messages.scrollTop = messages.scrollHeight;
  }
}

function updateUsersOnline(usersOnline) {
  usersList.innerHTML = "";
  for (const user in usersOnline) {
    const li = document.createElement("li");
    li.classList.add("user__item");

    const pStatus = document.createElement("p");
    pStatus.classList.add("user__item-online");

    const pUser = document.createElement("p");
    pUser.classList.add("user__item-name");
    pUser.innerText = usersOnline[user];

    li.appendChild(pStatus);
    li.appendChild(pUser);
    usersList.appendChild(li);
  }
}

setUsernameButton.addEventListener("click", () => {
  const newUsername = usernameInput.value.trim();
  if (newUsername !== "") {
    username = newUsername;
    socket.emit("set username", username);
    usernameInput.disabled = true;
    setUsernameButton.disabled = true;
  }
});

document.querySelector("form").addEventListener("submit", (e) => {
  e.preventDefault();
  if (input.value) {
    socket.emit("chat message", input.value);
    input.value = "";
    input.focus();
  }
});

socket.on("message", (msg) => {
  addMessageAndScrollToBottom(msg);
});

socket.on("usersOnline", (users) => {
  updateUsersOnline(users);
});

socket.on("disconnect", () => {
  addMessageAndScrollToBottom("You have been disconnected");
});

socket.on("reconnect", () => {
  if (username) {
    addMessageAndScrollToBottom("You have been reconnected");
    socket.emit("set username", username);
  }
});

socket.on("error", (error) => {
  addMessageAndScrollToBottom(`An error occurred: ${error}`);
});
