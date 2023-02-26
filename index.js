import { config } from "dotenv";
import express from "express";
import multer from "multer";
import { insertToDb, fetchFromDb } from "./mongo.js";
import { logger } from "./logconfig.js";
import { getDbClient } from "./mongo.js";

const app = express();

config();
const port = process.env.PORT || 3000;

const upload = multer({ dest: "uploads/" });

app.get("/image/:id", async function (req, res) {
  const db = getDbClient();
  const files = db.collection("asdad.files");
  const count = await files.countDocuments({ _id: req.params.id });

  if (!count) {
    logger.error("id doesn't exist in database");
    return res.send(404, "No file found with given id");
  }
  const doc = await files.findOne({ _id: req.params.id });
  res.set("content-type", doc.contentType);
  const downloadStream = await fetchFromDb("asdad", req.params.id);
  downloadStream.pipe(res);
});

app.post("/image/upload", upload.single("file"), async (req, res) => {
  const { file } = req;
  // add mimetype of file and hash to metadata for every file being stored
  // before uploading check whether hash exists
  // hash is of multer file buffer
  if (Buffer.from(file.path))
    if (!file.mimetype.startsWith("image/"))
      return res.send(415, "only image file is supported!");

  const id = await insertToDb(file, file.originalname, "asdad");
  logger.info("file " + file.originalname + " uploaded successfully!");
  return res.send(
    "uploaded file at :" + "http://localhost:" + port + "/image/" + id
  );
  // empty uploads folder
});

app.listen(port, function () {
  console.log("Server started on port: " + port);
});
