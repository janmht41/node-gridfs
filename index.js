let express = require("express");
let app = express();
const multer = require("multer");
const { insertToDb, fetchFromDb } = require("./mongo.js");
const fs = require("fs");
const path = require("path");
// let bodyParser = require("body-parser");

const upload = multer({ dest: "uploads/" });

// app.use(bodyParser.json());

app.get("/image/:fileName", async function (req, res) {
  res.set("content-type", "image/png");
  const downloadStream = await fetchFromDb("asdad", req.params.fileName);
  downloadStream.pipe(res);
});

app.post("/image/upload", upload.single("file"), (req, res) => {
  const { file } = req;
  // console.log("FILE", file);
  insertToDb(file, "abc", "asdad");

  return res.send("File Uploaded");
});

app.listen(3000, function () {
  console.log("Server started on port: 3000");
});
