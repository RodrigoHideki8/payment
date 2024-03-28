import { Injectable, LoggerService, LogLevel } from '@nestjs/common';
import * as winston from 'winston';

const logLevels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5,
  verbose: 6,
};

@Injectable()
export class WinstonAdapter implements LoggerService {
  private readonly logger: any;
  constructor() {
    this.logger = winston.createLogger({
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'MMM-DD-YYYY HH:mm:ss',
        }),
        winston.format.json(),
        winston.format.prettyPrint(),
      ),
      exitOnError: false,
      level: 'debug',
      levels: logLevels,
    });
    if (this.isDevelopmentEnv()) {
      this.logger.add(this.getFileTransport());
      this.logger.add(this.getConsoleTransport());
    }
  }

  private getFileTransport(): winston.transport {
    return new winston.transports.File({
      filename: 'error.log',
      level: 'debug',
    });
  }
  private getConsoleTransport(): winston.transport {
    return new winston.transports.Console({ format: winston.format.simple() });
  }

  private isDevelopmentEnv() {
    return process.env.NODE_ENV !== 'production';
  }

  error(message: any): any {
    this.logger.error(message);
  }
  log(message: any): any {
    this.logger.debug(message);
  }

  warn(message: any): any {
    this.logger.warn(message);
  }

  debug(message: any) {
    this.logger.debug(message);
  }
  setLogLevels(levels: LogLevel[]) {
    throw new Error('Method not implemented.');
  }
  verbose(message: any) {
    this.logger.verbose(message);
  }
}
