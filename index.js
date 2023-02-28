import { config } from "dotenv";
import express from "express";
import multer from "multer";
import { insertToDb, fetchFromDb, getDbClient } from "./mongo.js";
import { logger } from "./logconfig.js";
import { createHash } from "crypto";
import fs from "fs";
import path from "path";
const app = express();

config();
const port = process.env.PORT || 3000;

const upload = multer({ dest: "uploads/" });

const getFileHash = (file, hashName) => {
  return new Promise((resolve, reject) => {
    const hash = createHash(hashName);
    const stream = fs.createReadStream(Buffer.from(file.path));
    stream.on("error", (err) => reject(err));
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
  });
};

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

  const hash = await getFileHash(file, "sha1");
  const db = getDbClient();
  const files = db.collection("asdad.files");

  const count = await files.countDocuments({
    metadata: { hash },
  });

  if (count) {
    logger.info("file alreadty exists in db");
    const fileId = await files.findOne({ metadata: { hash } }).then((doc) => {
      return doc._id;
    });
    return res.send(
      409,
      "File already exists " + "http://localhost:" + port + "/image/" + fileId
    );
  }

  file.fileHash = hash;

  if (!file.mimetype.startsWith("image/"))
    return res.send(415, "only image file is supported!");

  const id = await insertToDb(file, file.originalname, "asdad");
  logger.info(
    "file " +
      file.originalname +
      " uploaded successfully!" +
      ", file size : " +
      file.size +
      " bytes"
  );
  clearUploads("uploads");
  return res.send(
    "uploaded file at :" + "http://localhost:" + port + "/image/" + id
  );
});

const clearUploads = (directory) => {
  fs.readdir(directory, (err, files) => {
    if (err) throw err;

    for (const file of files) {
      fs.unlink(path.join(directory, file), (err) => {
        if (err) throw err;
      });
    }
    logger.info("emptied upload dir");
  });
};

app.listen(port, function () {
  logger.info("Server started");
  console.log("Server started on port: " + port);
});
