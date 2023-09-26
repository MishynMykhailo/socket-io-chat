const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// set static folder
app.use(express.static(path.join(__dirname, "frontend")));

// Отправка HTML-страницы для клиентов
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

// Словарь для хранения имен пользователей
const users = {};
// Запуск при подключении клиента
io.on("connection", (socket) => {
  console.log("New websocket connection");

  // Обработка события "set username" для установки имени пользователя
  socket.on("set username", (username) => {
    users[socket.id] = username;

    const msg = "has joined the chat";
    if (username) {
      io.emit("message", { user: username, msg: msg });
      io.emit("usersOnline", users);
    } else {
      io.emit("message", { user: "Anonymous", msg: "has joined the chat" });
      delete users[socket.id];
    }
  });

  // Обработка события "chat message" для отправки сообщений
  socket.on("chat message", (msg) => {
    // Получение имени пользователя по ID сокета
    const username = users[socket.id];

    // Отправка сообщения с именем пользователя
    io.emit("message", { user: username, msg: msg });
  });

  // Обработка отключения клиента
  socket.on("disconnect", () => {
    const username = users[socket.id];
  
    const msg = "has left the chat";
    if (username) {
      io.emit("message", { user: username, msg: msg });
      delete users[socket.id];
      io.emit("usersOnline", users);
    } else {
      io.emit("message", { user: "Anonymous", msg: "has left the chat" });
      delete users[socket.id];
      
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
