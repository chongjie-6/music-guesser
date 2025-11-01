const express = require("express");
const app = express();
const port = process.env.PORT || 3500;
const cors = require("cors");
const corsOptions = require("./config/corsOptions");

app.use(cors(corsOptions));

app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to the Music Guesser API" });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
module.exports = app;
