import { app } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";

const forceShutdownMs = 10000;

const server = app.listen(env.PORT, () => {
  logger.info("Server listening on port " + env.PORT);

  if (env.NODE_ENV === "development") {
    logger.info("Local API available at http://localhost:" + env.PORT + "/api");
  }
});

function shutdown(signal) {
  logger.info("Received " + signal + ". Starting graceful shutdown.");

  const forceShutdown = setTimeout(() => {
    logger.error("Forced shutdown after timeout.");
    process.exit(1);
  }, forceShutdownMs);

  server.close((err) => {
    clearTimeout(forceShutdown);

    if (err) {
      logger.error("Error while closing HTTP server.", { message: err.message });
      process.exit(1);
    }

    logger.info("HTTP server closed. Shutdown complete.");
    process.exit(0);
  });
}

server.on("error", (err) => {
  logger.error("Server startup failed.", { message: err.message });
  process.exit(1);
});

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("uncaughtException", (err) => {
  logger.error("Uncaught exception.", { message: err.message });
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  const message = reason instanceof Error ? reason.message : "Unhandled promise rejection";
  logger.error("Unhandled rejection.", { message });
  process.exit(1);
});
