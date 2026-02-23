const express = require("express");
const app = express();
const PORT = process.env.PORT || 3500;
const cors = require("cors");
const { allowedOrigins, corsOptions } = require('./config/corsOptions');
const { Server } = require("socket.io");
app.use(cors(corsOptions));
const { createServer } = require("http");
const path = require("path");

// Routes
const songRoutes = require("./routes/songRoutes");
const limiter = require("./middleware/rateLimiter");

app.use(songRoutes);

// Limiter
app.use(limiter);

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins
  },
});

const socketHandler = require("./sockets/index");
socketHandler(io);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});

module.exports = server;
