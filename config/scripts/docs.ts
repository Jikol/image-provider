import fs from "fs";
import path from "path";
import swaggerJsdoc from "swagger-jsdoc";
import { Options } from "swagger-jsdoc";

import config from "/config";
import log from "/logger";

const docsDir = path.join(config.ROOT_PATH, "docs");
const docsLocation = path.join(docsDir, "openapi.json");

const options: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Image Provider",
      version: "{{VERSION}}",
      description: "API for uploading and serving images for Retina API",
      license: {
        name: "MIT",
        url: "https://opensource.org/license/mit"
      }
    },
    servers: [
      {
        url: "https://{{HOST}}"
      }
    ],
    security: []
  },
  apis: [
    path.join(config.ROOT_PATH, "src", "core", "routers.ts"),
    path.join(config.ROOT_PATH, "src", "http", "routers.ts")
  ]
};

((): void => {
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir);
  }
  fs.writeFile(
    docsLocation,
    JSON.stringify(swaggerJsdoc(options), null, 2),
    "utf8",
    (err) => {
      if (!err) {
        log.info(`OpenAPI docs generated successfully! (${docsLocation})`);

        return;
      }

      log.error(err.message);
    }
  );
})();
