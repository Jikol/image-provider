import kleur from "kleur";
import pino from "pino";
import type { Logger } from "pino";
import pretty from "pino-pretty";

import config from "/config.ts";

const stream = pretty({
  colorize: true,
  ignore: "scope",
  messageFormat: (log, messageKey) =>
    log.scope ? `${log.scope} ${log[messageKey]}` : String(log[messageKey])
});

const log: Logger = pino(
  {
    level: config.ENVS.IMAGE_PROVIDER_DEBUG ? "debug" : "info",
    formatters: {
      log: (obj) =>
        JSON.parse(
          JSON.stringify(obj, (_key, value) =>
            value instanceof RegExp ? value.toString() : value
          )
        )
    }
  },
  stream
);

export default log;

export const honoLog = log.child({ scope: kleur.magenta("[Hono]") });
