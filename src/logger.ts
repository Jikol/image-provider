import pino from "pino";
import type { Logger } from "pino";
import pretty from "pino-pretty";

import config from "@/config";

const stream = pretty({
  colorize: true
});

const logger: Logger = pino(
  {
    level: config.DEBUG ? "debug" : "info"
  },
  stream
);

logger.debug(config);

export default logger;
