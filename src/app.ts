import { Hono } from "hono";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { trimTrailingSlash } from "hono/trailing-slash";

import {
  docsMiddleware,
  errorMiddleware,
  methodNotAllowedMiddleware,
  notFoundMiddleware
} from "@/core/middlewares.ts";
import { routers } from "@/core/routers.ts";

import config from "/config.ts";
import log, { honoLog } from "/logger.ts";

/** Output global config */
log.debug(config, "Config");

/** Preparation of required system locations */
await Bun.$`mkdir -p ${config.ENVS.IMAGE_PROVIDER_UPLOAD_PATH}`;

/** Instantiate Hono server */
const hono = new Hono();

/** Add helper middlewares [order matters!] */
hono.use(logger((message, ...rest) => honoLog.info([message, ...rest].join(" "))));
hono.use(prettyJSON({ force: config.ENVS.IMAGE_PROVIDER_DEBUG }));
hono.use(trimTrailingSlash());
hono.use(docsMiddleware(hono));
hono.use(methodNotAllowedMiddleware(hono));

/** Add routers */
hono.route("/", routers);

/** Add error middlewares */
hono.notFound(notFoundMiddleware);
hono.onError(errorMiddleware);

/** Bootstrap application */
const bootstrapApp = async (
  hono: Hono
): Promise<[Bun.Server<undefined>, Array<() => Promise<void>>]> => {
  const server = Bun.serve({
    port: config.ENVS.IMAGE_PROVIDER_PORT,
    idleTimeout: 30,
    fetch: hono.fetch
  });

  honoLog.info(
    `Hono HTTP server started & listening on port ${config.ENVS.IMAGE_PROVIDER_PORT}`
  );

  return [server, []];
};

/** Application entrypoint */
bootstrapApp(hono)
  .then(([server, cleanups]) => {
    /** Graceful shutdown handling */
    let shuttingDown = false;
    const handleExit = async (err?: Error): Promise<void> => {
      if (shuttingDown) return;
      shuttingDown = true;

      if (err) {
        log.error(err, "Runtime error occurred");
        process.exitCode = 1;
      }

      log.info("Received shutdown signal. Closing server...");

      try {
        for (const cleanup of cleanups) {
          await cleanup();
        }
        // noinspection ES6MissingAwait
        server.stop(true);
        log.info("Server shut down gracefully.");
      } catch (shutdownErr) {
        log.error(shutdownErr, "Error during shutdown");
        process.exitCode = 1;
      } finally {
        process.exit();
      }
    };

    process.on("SIGINT", () => handleExit());
    process.on("SIGTERM", () => handleExit());
    process.on("uncaughtException", (err: Error) => handleExit(err));
  })
  .catch((err) => {
    log.error(err, "Application startup failed!");
    process.exit(1);
  });
