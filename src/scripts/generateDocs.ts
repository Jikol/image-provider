import fs from "fs";
import path from "path";
import process from "process";
import swaggerJsdoc from "swagger-jsdoc";

import config from "@/config";
import logger from "@/logger";

const docsDir = path.join(process.cwd(), process.env.NODE_DEV ? "" : "dist", "docs");
const docsLocation = path.join(docsDir, "openapi.json");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Image Provider",
      version: config.VERSION,
      description: "API for uploading and serving images for Retina API"
    },
    servers: [
      {
        url: `http://${config.NODE_HOSTNAME}:${config.NODE_PORT}${config.BASE_PATH}`
      }
    ]
  },
  apis: [path.join(config.SRC_PATH, "router/*.ts")]
};

((): void => {
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir);
  }
  if (fs.existsSync(docsLocation) && process.env.NODE_DEV) return;
  fs.writeFile(
    docsLocation,
    JSON.stringify(swaggerJsdoc(options), null, 2),
    "utf8",
    (err) => {
      if (!err) {
        logger.info(`OpenAPI docs generated successfully! (${docsLocation})`);

        return;
      }

      logger.error(err.message);
    }
  );
})();
