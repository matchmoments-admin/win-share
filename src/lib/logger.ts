import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

const logger = pino({
  level: process.env.LOG_LEVEL ?? (isProduction ? "info" : "debug"),
  ...(isProduction
    ? {
        // Structured JSON output in production
        formatters: {
          level(label) {
            return { level: label };
          },
        },
        timestamp: pino.stdTimeFunctions.isoTime,
      }
    : {
        // Pretty printing in development
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        },
      }),
});

/**
 * Create a child logger scoped to a specific module.
 *
 * @example
 * ```ts
 * const log = createLogger("webhooks");
 * log.info({ event: "stripe.checkout" }, "Webhook received");
 * ```
 */
export function createLogger(module: string) {
  return logger.child({ module });
}

export default logger;
