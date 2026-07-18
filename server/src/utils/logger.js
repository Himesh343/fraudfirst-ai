const prefix = "[FraudFirst]";

function write(level, message, metadata) {
  const parts = [prefix, "[" + level + "]", message];
  const method = level === "ERROR" ? "error" : "log";

  if (metadata && Object.keys(metadata).length > 0) {
    console[method](...parts, metadata);
    return;
  }

  console[method](...parts);
}

export const logger = {
  info(message, metadata) {
    write("INFO", message, metadata);
  },
  error(message, metadata) {
    write("ERROR", message, metadata);
  }
};
