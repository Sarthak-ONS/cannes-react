const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, "../", "/vars", ".env"),
});

const morgan = require("morgan");
const express = require("express");

const authRoutes = require("./routes/auth");

const app = express();

const PORT = process.env.PORT;

app.use(morgan("dev"));

app.use("/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`RUNNING ON PORT=${PORT}`);
});
