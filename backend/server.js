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
const roomRoutes = require("./routes/roomRoutes");
const limiter = require("./middleware/rateLimiter");

app.use(songRoutes);
app.use(roomRoutes);

app.use(limiter);

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

module.exports = { app, io };
