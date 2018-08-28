/* common error thrown in this file */
let ERRORS = {
    NOIMPL: new Error('Must implement')
};

/**
 * Represents a logger.
 */
class Logger {

    /**
     * Configures the logger instance with the specified
     * options.
     * @param {*} options 
     */
    configure(options) {
        throw ERRORS.NOIMPL;
    }

    /**
     * Logs a debug message.
     * @param {*} msg 
     * @param {*} meta
     */
    debug(msg, meta) {
        throw ERRORS.NOIMPL;
    }

    /**
     * Logs an info message.
     * @param {*} msg 
     * @param {*} meta
     */
    info(msg, meta) {
        throw ERRORS.NOIMPL;
    }

    /**
     * Logs a warn message.
     * @param {*} msg 
     * @param {*} meta
     */
    warn(msg, meta) {
        throw ERRORS.NOIMPL;
    }

    /**
     * Logs an error message.
     * @param {*} msg 
     * @param {*} meta
     */
    error(msg, meta) {
        throw ERRORS.NOIMPL;
    }
}

module.exports = Logger;