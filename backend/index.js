const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, "../", "/vars", ".env"),
});

const express = require("express");

const app = express();

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`RUNNING ON PORT=${PORT}`);
});
