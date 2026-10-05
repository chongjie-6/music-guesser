const express = require("express");
const app = express();
const PORT = process.env.PORT || 3500;
const cors = require("cors");
const { allowedOrigins, corsOptions } = require('./config/corsOptions');
const { Server } = require("socket.io");
// Behind Railway's proxy; without this every client shares the proxy's IP
app.set("trust proxy", 1);
app.use(cors(corsOptions));
const { createServer } = require("http");
const path = require("path");

const limiter = require("./middleware/rateLimiter");

// Limiter
app.use(limiter);

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins
  },
  maxHttpBufferSize: 1e4,
});

const socketHandler = require("./sockets/index");
socketHandler(io);

app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});

module.exports = server;
