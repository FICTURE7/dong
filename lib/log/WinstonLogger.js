const winston = require('winston');
const Logger = require('./Logger');

/**
 * Winston implementation of a Logger.
 */
class WinstonLogger extends Logger {

    /**
     * Constructs a new instance of the WinstonLogger
     * class.
     * @param {*} label
     */
    constructor(label) {
        super();

        /**
         * Winston logger its wrapping.
         */
        this.winston = winston.createLogger({
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.label({label: label}),
                        winston.format.colorize(),
                        winston.format.timestamp(),
                        winston.format.splat(),
                        winston.format.printf(info => {
                            return `${info.timestamp} [${info.level}]<${info.label}>: ${info.message}`
                        })
                    )
                })
            ]
        });
    }

    /**
     * Configures the WinstonLogger instance with the
     * specified options.
     * @param {*} options 
     */
    configure(options) {
        /* defaults */
        options.level = options.level || 'info';

        /*
         * create a file transport if a file name was
         * specified
         */
        if (options.filename) {
            this.winston.add(
                new winston.transports.File({ 
                    filename: options.filename,
                    format: winston.format.combine(
                        winston.format.timestamp(),
                        winston.format.prettyPrint()
                    )
                })
            );
        }

        /* 
         * configure each transport in the winston logger instance
         * to use the one specified in the options
         */
        for (const transport of this.winston.transports.values()) {
            transport.level = options.level;
        }
    }

    /**
     * Logs a debug message.
     * @param {*} msg 
     * @param {*} meta
     */
    debug(msg, meta) {
        this.winston.info(msg, meta);
    }

    /**
     * Logs an info message.
     * @param {*} msg 
     * @param {*} meta
     */
    info(msg, meta) {
        this.winston.info(msg, meta);
    }

    /**
     * Logs a warn message.
     * @param {*} msg 
     * @param {*} meta
     */
    warn(msg, meta) {
        this.winston.warn(msg, meta);
    }

    /**
     * Logs an error message.
     * @param {*} msg 
     * @param {*} meta
     */
    error(msg, meta) {
        this.winston.error(msg, meta);
    }
}

module.exports = WinstonLogger;