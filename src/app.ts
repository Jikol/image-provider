import fs from "fs";
import express from "express";
import multer from "multer";

import config from "./config";

import type { Express } from "express";
import type { Multer } from "multer";

console.log(config.UPLOAD_DIR);

const app: Express = express();
const storage = multer.diskStorage({
  destination: (req, file, cb): void => {
    if (!fs.existsSync(config.UPLOAD_DIR)) {
      fs.mkdirSync(config.UPLOAD_DIR);
    }
    cb(null, config.UPLOAD_DIR);
  },
  filename(req, file, cb): void {
    cb(null, file.originalname);
  }
});
const upload: Multer = multer({ storage });

app.get("/", (req, res): void => {
  res.send("Hello World");
});

app.post("/api/upload", upload.single("file"), (req, res): void => {
  res.send("TEST");
});

app.listen("8000", () => {
  console.log("listening on port 8000");
});
