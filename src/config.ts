import process from "process";
import path from "path";

export default {
  UPLOAD_DIR: path.resolve(
    process.env.NODE_UPLOAD_DIR ?? path.resolve(process.cwd(), "uploads")
  )
};
