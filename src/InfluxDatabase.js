const influx = require('influx');
const Database = require('./Database');

class InfluxDatabase extends Database {

	constructor() {
		super();

		this._messages = {
			add: function(message, timestamp) {
				
			}
		};
	}

	configure(options) {
		if (!options.host) {
			throw new Error('`options.host` not set.');
		}

		let self = this;
		/* initialize influx db connection */
		self.client = new influx.InfluxDB({
			database: 'dong',
			host: options.host,
			port: options.port,
			username: options.username,
			password: options.password,
			schema: [
				{
					measurement: 'messages',
					tags: [
						'message',
						'channel',
						'guild'
					],
					fields: {
						author_id: influx.FieldType.INTEGER,
						channel_id: influx.FieldType.INTEGER,
						guild_id: influx.FieldType.INTEGER
					}
				},
				{
					measurement: 'users',
					tags: [
						'name'
					],
					fields: {
						user_id: influx.FieldType.INTEGER,
						status: influx.FieldType.INTEGER
					}
				}
			]
		});

		self.client.dropDatabase('dong').then(() => {
			self.client.createDatabase('dong');
		});
	}

	get messages() {
		return this._messages;
	}
}

module.exports = InfluxDatabase;
