/* common error thrown in this file */
let ERRORS = {
    NOIMPL: new Error('Must implement')
};

/**
 * Represents a table implementation.
 * @abstract
 */
class Table {
    
    /**
     * Determines if an item at the specified
     * timestamp exists.
     * @returns {Promise<boolean>}
     */
    exists(timestamp) {
        throw ERRORS.NOIMPL;
    }

    /**
     * Adds the specified item at the current timestamp
     * if timestamp was not specified.
     * @param {Object} item Item to add.
     * @param {number} [timestamp] Timestamp to add the item at.
     * @returns {Promise<void>}
     */
    add(item, timestamp) {	
        throw ERRORS.NOIMPL;
    }
}

/**
 * Represents a database implementation.
 * @abstract
 */
class Database {

    /**
     * Configures the database instance with the specified
     * option object.
     */
    configure(options) {
        /* space */
    }

    /**
     * Starts the database instance.
     * @return {Promise<void>}
     */
    start() {
        throw ERRORS.NOIMPL;
    }

    /**
     * Destroys the database instance.
     * @return {Promise<void>}
     */
    destroy() {
        return Promise.resolve();
    }

    /**
     * Guilds in the database.
     * @return {Table}
     */
    get guilds() {
        throw ERRORS.NOIMPL;
    }

    /**
     * Messages in the database.
     * @return {Table}
     */
    get messages() {
        throw ERRORS.NOIMPL;
    }

    /**
     * Users in the database.
     * @return {Table}
     */
    get users() {
        throw ERRORS.NOIMPL;
    }
}

module.exports = {
    Table: Table,
    Database: Database
}
