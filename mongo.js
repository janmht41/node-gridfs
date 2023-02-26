const { MongoClient, GridFSBucket } = require("mongodb");
const fs = require("fs");
require('dotenv').config()

const client = new MongoClient(process.env.DB_URL);

client.connect();

const insertToDb = async (file, fileName, bucketName) => {
  const db = client.db(process.env.DB_NAME);
  const bucket = new GridFSBucket(db, { bucketName });
  console.log(file);

  fs.createReadStream(Buffer.from(file.path)).pipe(
    bucket.openUploadStream(fileName, {
      chunkSizeBytes: 1048576,
    })
  );
};

const fetchFromDb = async (bucketName, fileName) => {
  const db = client.db("TESTDB");
  const bucket = new GridFSBucket(db, { bucketName });
  const downloadStream = bucket.openDownloadStreamByName(fileName)
  return downloadStream;
};

module.exports = { fetchFromDb, insertToDb };
