import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport:
    process.env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        }
      : undefined,
});

export function logSecurityEvent(
  event: string,
  details: Record<string, unknown>
): void {
  logger.warn(
    {
      event,
      ...details,
      timestamp: new Date().toISOString(),
    },
    `Security Event: ${event}`
  );
}
