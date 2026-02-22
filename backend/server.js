const express = require("express");
const app = express();
const port = process.env.PORT || 3500;
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const { Server } = require("socket.io");
app.use(cors(corsOptions));
const { createServer } = require("http");

// Routes
const songRoutes = require("./routes/songRoutes");
const limiter = require("./middleware/rateLimiter");

app.use(songRoutes);

// Limiter
app.use(limiter);

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

const socketHandler = require("./sockets/index");
socketHandler(io);

module.exports = server;
