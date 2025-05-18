import process from 'node:process';
import winston from 'winston';

/**
 * Functions for handling application logging
 */
const loggerFactory = {
	/**
	 * Get a specific logger for a component
	 * @param component Component name
	 */
	getLogger(component: string): winston.Logger {
		return this.getInstance().child({component});
	},

	instance: undefined as winston.Logger | undefined,

	/**
	 * Get the logger instance (singleton)
	 */
	getInstance(): winston.Logger {
		this.instance ||= winston.createLogger({
			level: process.env.LOG_LEVEL ?? 'info',
			format: winston.format.combine(
				winston.format.timestamp(),
				winston.format.colorize(),
				winston.format.printf(({level, message, timestamp}) => {
					return `${String(timestamp)} ${String(level)}: ${String(message)}`;
				}),
			),
			transports: [new winston.transports.Console()],
		});

		return this.instance;
	},
};

// Export the logger factory and a default logger instance
export const logger = loggerFactory;
export default loggerFactory.getInstance();
