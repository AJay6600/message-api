const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const feedRouter = require("./routes/feed");
const authRouter = require("./routes/auth");
const mongoose = require("mongoose");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

/** This is run the backend app */
const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    const sanitizedFilename =
      new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname;
    cb(null, sanitizedFilename);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

/** middleware for accepting the data in format of jason */
app.use(bodyParser.json());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

/** middleware for cors */
app.use((req, res, next) => {
  /** this allow all website to access the backed */
  res.setHeader("Access-Control-Allow-Origin", "*");

  /** methods that is applicable for accessing the data */
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );

  /** cors headers */
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

/** middleware for handling image route */
app.use("/images", express.static(path.join(__dirname, "images")));

/** middleware for uploading image file */
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

/** routes for feed */
app.use("/feed", feedRouter);

/** routes for authentication */
app.use("/auth", authRouter);

/** middleware that handles the error */
app.use((err, req, res, next) => {
  res
    .status(err.statusCode || 500)
    .json({ messages: err.message, data: err.data });
});

/** connecting to mongodb */
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server started on ${process.env.PORT}`);
    });
  })
  .catch((err) => console.log(err));
