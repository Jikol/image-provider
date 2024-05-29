import fs from "fs";
import path from "path";
import swaggerJsdoc from "swagger-jsdoc";

import config from "@/config";
import logger from "@/logger";
import { versionedPaths } from "@/routers";

const docsDir = path.join(process.cwd(), "docs");
const docsLocation = path.resolve(docsDir, "openapi.json");
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Image Provider",
      version: config.VERSION,
      description: "API for uploading and serving images for Retina API"
    },
    servers: versionedPaths.map((path) => {
      return {
        url: `http://${config.HOSTNAME}:${config.PORT}${path}`
      };
    })
  },
  apis: [path.resolve(__dirname, "router/*.ts")]
};

const generateDocs = (): void => {
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir);
  }
  if (fs.existsSync(docsLocation)) return;
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
};

if (!config.DEV) generateDocs();

export { generateDocs };
