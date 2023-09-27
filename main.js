const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 3000;

// Set static folder
const staticFolderPath = path.join(__dirname, "frontend");
app.use(express.static(staticFolderPath));

// Send HTML page to clients
app.get("/", (req, res) => {
  res.sendFile(path.join(staticFolderPath, "index.html"));
});

const users = {};

function broadcastMessage(user, msg) {
  io.emit("message", { user, msg });
  io.emit("usersOnline", users);
}

io.on("connection", (socket) => {
  console.log("New websocket connection");

  socket.on("set username", (username) => {
    users[socket.id] = username || "Anonymous";
    broadcastMessage(users[socket.id], "has joined the chat");
  });

  socket.on("chat message", (msg) => {
    const username = users[socket.id] || "Anonymous";
    broadcastMessage(username, msg);
  });

  socket.on("disconnect", () => {
    const username = users[socket.id] || "Anonymous";
    delete users[socket.id];
    broadcastMessage(username, "has left the chat");
  });
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
