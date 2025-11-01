const express = require("express");
const app = express();
const port = process.env.PORT || 3500;
const cors = require("cors");
const corsOptions = require("./config/corsOptions");

app.use(cors(corsOptions));

// Routes
const songRoutes = require("./routes/songRoutes");

app.use(songRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
module.exports = app;
