import pino from "pino";
import type { Logger } from "pino";
import pretty from "pino-pretty";

import config from "/config";

const stream = pretty({
  colorize: true
});

const log: Logger = pino(
  {
    level: config.IMAGE_PROVIDER_DEBUG ? "debug" : "info"
  },
  stream
);

export default log;
