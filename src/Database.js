
/**
 * Represents a table implementation.
 * @abstract
 */
class Table {
	
	/**
	 * Determines if an item at the specified
	 * timestamp exists.
	 * @returns {Promise<Boolean>}
	 */
	exists(timestamp) {
		throw new Error('Must implement.');
	}

	/**
	 * Adds the specified item at the current timestamp
	 * if timestamp was not specified.
	 * @param {Object} item Item to add.
	 * @param {number} [timestamp] Timestamp to add the item at.
	 * @returns {Promise>Void>}
	 */
	add(item, timestamp) {	
		throw new Error('Must implement.');
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
	 * @return {Promise<Void>}
	 */
	start() {
		throw new Error('Must implement.');
	}

	/**
	 * Guilds in the database.
	 * @return {Table}
	 */
	get guilds() {
		throw new Error('Must implement.');
	}

	/**
	 * Messages in the database.
	 * @return {Table}
	 */
	get messages() {
		throw new Error('Must implement.');
	}

	/**
	 * Users in the database.
	 * @return {Table}
	 */
	get users() {
		throw new Error('Must implement.');
	}
}

module.exports = {
	Table: Table,
	Database: Database
}
