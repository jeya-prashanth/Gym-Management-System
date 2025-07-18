import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { combine, timestamp, printf, colorize, json } = winston.format;

const logFormat = printf(({ level, message, timestamp, ...meta }) => {
  let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
  if (Object.keys(meta).length > 0) {
    log += `\n${JSON.stringify(meta, null, 2)}`;
  }
  return log;
});

const errorFilter = winston.format((info) => {
  return info.level === 'error' ? info : false;
});

const infoFilter = winston.format((info) => {
  return info.level === 'info' ? info : false;
});

const transports = [
  new winston.transports.Console({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: combine(colorize(), logFormat)
  }),
  new DailyRotateFile({
    filename: path.join(__dirname, '../../logs/error-%DATE%.log'),
    level: 'error',
    format: combine(errorFilter(), timestamp(), json()),
    maxSize: '20m',
    maxFiles: '14d'
  }),
  new DailyRotateFile({
    filename: path.join(__dirname, '../../logs/combined-%DATE%.log'),
    format: combine(timestamp(), json()),
    maxSize: '20m',
    maxFiles: '30d'
  })
];

if (process.env.NODE_ENV === 'production') {
  transports.push(
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/audit.log'),
      level: 'info',
      format: combine(infoFilter(), timestamp(), json())
    })
  );
}

const logger = winston.createLogger({
  level: 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true })
  ),
  defaultMeta: { service: 'gym-management-api' },
  transports,
  exceptionHandlers: [
    new winston.transports.File({ filename: path.join(__dirname, '../../logs/exceptions.log') })
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: path.join(__dirname, '../../logs/rejections.log') })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      responseTime: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.user?.id || 'anonymous'
    };

    if (res.statusCode >= 400) {
      logger.error(`${req.method} ${req.originalUrl}`, logData);
    } else {
      logger.http('Request', logData);
    }
  });

  next();
};

export const errorLogger = (error, req, res, next) => {
  logger.error(error.message, {
    stack: error.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.id || 'anonymous',
    body: req.body,
    query: req.query,
    params: req.params
  });
  
  next(error);
};

export const auditLogger = (action, data) => {
  logger.info(`AUDIT: ${action}`, {
    ...data,
    timestamp: new Date().toISOString()
  });
};

export const securityLogger = (event, meta = {}) => {
  logger.warn(`SECURITY: ${event}`, {
    ...meta,
    timestamp: new Date().toISOString()
  });
};

export default logger;
