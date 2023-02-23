const { MongoClient, GridFSBucket } = require("mongodb");
const fs = require("fs");

const url = "mongodb://localhost:27017";

const client = new MongoClient(url);

client.connect();

const insertToDb = async (file, fileName, bucketName) => {
  const db = client.db("TESTDB");
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
