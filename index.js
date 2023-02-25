let express = require("express");
let app = express();
const multer = require("multer");
const { insertToDb, fetchFromDb } = require("./mongo.js");
const path = require("path");
let {logger} = require('./logconfig')

const upload = multer({ dest: "uploads/" });

app.get("/image/:fileName", async function (req, res) {
  res.set("content-type", "image/png");
  const downloadStream = await fetchFromDb("asdad", req.params.fileName);
  downloadStream.pipe(res);
});

app.post("/image/upload", upload.single("file"), (req, res) => {
  const { file } = req;
  insertToDb(file, "abc", "asdad");
  logger.info('file '+file.originalname +' uploaded successfully!')
  return res.send("File Uploaded");
});

app.listen(3000, function () {
  console.log("Server started on port: 3000");
});
