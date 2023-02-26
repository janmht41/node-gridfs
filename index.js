let express = require("express");
require("dotenv").config();
let app = express();
const multer = require("multer");
const { insertToDb, fetchFromDb } = require("./mongo.js");

let { logger } = require("./logconfig");
const port = process.env.PORT || 3000;

const upload = multer({ dest: "uploads/" });

app.get("/image/:fileName", async function (req, res) {
  res.set("content-type", "image/png");
  const downloadStream = await fetchFromDb("asdad", req.params.fileName);
  downloadStream.pipe(res);
});

app.post("/image/upload", upload.single("file"), (req, res) => {
  const { file } = req;
  console.log(file.mimetype);
  if (!file.mimetype.startsWith("image/"))
    return res.send(415, "only image file is supported!");
  insertToDb(file, file.originalname, "asdad");
  logger.info("file " + file.originalname + " uploaded successfully!");
  return res.send("File Uploaded");
});

app.listen(port, function () {
  console.log("Server started on port: " + port);
});
