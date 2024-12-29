const express = require("express");
const bodyParser = require("body-parser");
const feedRouter = require("./routes/feed");
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
// app.use(bodyParser.json());
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

/** middleware that handles the error */
app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.statusCode || 500).json({ messages: err.message });
});

/** connecting to mongodb */
mongoose
  .connect(
    "mongodb+srv://contactajaymore:5snpCuJxvOGAmABW@cluster0.h2djow7.mongodb.net/messages?retryWrites=true&w=majority"
  )
  .then(() => {
    app.listen(8000, () => {
      console.log("Server started on 8000 port");
    });
  })
  .catch((err) => console.log(err));
