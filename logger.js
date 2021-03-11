const winston = require("winston");

module.exports = winston.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({
      filename: "logs/log.txt",
      format: winston.format.printf(
        (log) => `[${log.level.toUpperCase()}] - ${log.message}`
      ),
    }),
  ],
});
