import { MongoClient, GridFSBucket } from "mongodb";

import { config } from "dotenv";
import fs from "fs";
import { v4 } from "uuid";
config();

export const getDbClient = () => {
  const client = new MongoClient(process.env.DB_URL);
  client.connect();
  const db = client.db(process.env.DB_NAME);
  return db;
};
export const insertToDb = (file, fileName, bucketName) => {
  const db = getDbClient();
  const bucket = new GridFSBucket(db, { bucketName });
  console.log(file);
  const id = v4();
  return new Promise((resolve, reject) => {
    fs.createReadStream(Buffer.from(file.path)).pipe(
      bucket
        .openUploadStreamWithId(id, fileName, {
          chunkSizeBytes: 1048576,
          contentType: file.mimetype,
          metadata: { hash: file.fileHash },
        })
        .on("close", () => {
          resolve(id);
        })
        .on("error", (e) => {
          reject(new Error(e.message));
        })
    );
  });
};

export const fetchFromDb = async (bucketName, id, start, end) => {
  const db = getDbClient();
  const bucket = new GridFSBucket(db, { bucketName });
  if (!start) return bucket.openDownloadStream(id);
  const downloadStream = bucket.openDownloadStream(id, { start, end });
  return downloadStream;
};
