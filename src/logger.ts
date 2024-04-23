import pino from "pino";
import type { Logger } from "pino";

import config from "@/config";

const logger: Logger = pino({
  level: config.DEBUG ? "debug" : "info",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true
    }
  }
});

logger.debug(config);

export default logger;
