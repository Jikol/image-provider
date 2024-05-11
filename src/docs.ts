import fs from "fs";
import path from "path";
import swaggerJsdoc from "swagger-jsdoc";

import config from "@/config";
import logger from "@/logger";

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
        url: `http://${config.HOSTNAME}:${config.PORT}${config.BASE_PATH}`
      }
    ]
  },
  apis: [path.resolve(__dirname, "router/*.ts")]
};

const generateDocs = (): void => {
  if (fs.existsSync(path.join(config.APISCHEMA_DIR, "openapi.json"))) return;
  fs.writeFile(
    path.join(config.APISCHEMA_DIR, "openapi.json"),
    JSON.stringify(swaggerJsdoc(options), null, 2),
    "utf8",
    (err) => {
      if (!err) {
        logger.info(
          `OpenAPI docs generated successfully! (${config.APISCHEMA_DIR}/openapi.json)`
        );

        return;
      }

      logger.error(err.message);
    }
  );
};

export { generateDocs };
