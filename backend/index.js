const path = require("path");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary");
const mongoose = require("mongoose");
const morgan = require("morgan");
const express = require("express");

const authRoutes = require("./routes/auth");

const app = express();

require("dotenv").config({
  path: path.join(__dirname, "../", "/vars", ".env"),
});

const PORT = process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(morgan("dev"));
app.use(express.json());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/temp/",
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
    abortOnLimit: true,
    safeFileNames: true,
    limitHandler: (req, res, next) => {
      const err = new Error("File too large, max 10MB is expected");
      err.httpStatusCode = 413;
      return next(err);
    },
  })
);
app.use((req, res, next) => {
  if (req.files) {
    const file = req.files.image;
    if (
      file.mimetype == "image/jpeg" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/png"
    ) {
      return next();
    }
    const err = new Error("Invalid File. PNG, JPG, JPEG are allowed strictly.");
    err.httpStatusCode = 500;
    return next(err);
  }
  next();
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method == "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use("/auth", authRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  return res.status(error.httpStatusCode || 500).json({
    status: "ERROR",
    errorMessage: error.message,
    errorStatusCode: error.httpStatusCode,
  });
});

mongoose
  .connect(MONGODB_URI, { useUnifiedTopology: true, useNewUrlParser: true })
  .then((res) => {
    app.listen(PORT, () => {
      console.log("DATABASE CONNECTED");
      console.log(`Server is running on ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
