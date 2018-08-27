const influx = require('influx');
const { Table, Database } = require('./Database');

/**
 * InfluxDB implementation of a Table, which is 
 * known as a measurement in InfluxDB terminology.
 */
class InfluxTable extends Table {

    constructor(db, measurement, getFields, getTags, getTimestamp) {
        super();
        
        this.measurement = measurement;

        this._db = db;
        this._getFields = getFields;
        this._getTags = getTags;
        this._getTimestamp = getTimestamp;
    }

    exists(timestamp) {
        if (typeof timestamp !== 'number') {
            throw new Error('`timestamp` must be a number.');
        }

        let db = this._db;
        return new Promise((resolve, reject) => {
            db.query(`SELECT COUNT("time") FROM "${measurement}" WHERE time = ${timestamp}`).then(() => {
                
            }).catch((err) => resolve(err));
        });
    }

    add(item, timestamp) {
        let fields = this._getFields(item);
        let tags = this._getTags(item);

        return new Promise((resolve, reject) => {
            this._db.client.writePoints([{
                timestamp: timestamp,
                measurement: this.measurement,
                tags: tags,
                fields: fields
            }])
            .then(() => resolve())
            .catch(err => reject(err));
        });
    }

    addAll(items) {
        let points = [];
        for (let item of items.values()) {
            let fields = this._getFields(item);
            let tags = this._getTags(item);
            let timestamp = this._getTimestamp(item);

            points.push({
                timestamp: timestamp,
                measurement: this.measurement,
                tags: tags,
                fields: fields
            });
        }

        return new Promise((resolve, reject) => {
            this._db.client.writePoints(points)
                .then(() => resolve())
                .catch(err => reject(err));
        });
    }
}

/**
 * InfluxDB implementation of a Database.
 */
class InfluxDatabase extends Database {

    /**
     * Constructs a new instance of the InfluxDatabase
     * class
     */
    constructor() {
        super();

        this._guilds = new InfluxTable(this,
            'guilds',
            (guild) => {	
                return {
                    guild_id: guild.id
                };
            },
            (guild) => {
                return {
                    name: guild.name
                };
            }
        );

        this._users = new InfluxTable(this,
            'users',
            (user) => {
                function getStatus(presence) {
                    switch (presence.status) {
                        case 'online':
                            return 0;
                        case 'offline':
                            return 1;
                        case 'idle':
                            return 2;
                        case 'dnd':
                            return 3;

                        default:
                            return -1;
                    }
                }

                function getAppId(presence) {
                    if (!presence.game || !presence.game.applicationID) {
                        return -1;
                    }

                    return presence.game.applicationID;
                }

                return {
                    user_id: user.id,
                    app_id: getAppId(user.presence),
                    status: getStatus(user.presence)
                };
            },
            (user) => {
                function getAppName(presence) {	
                    if (!presence.game || !presence.game.name) {
                        return -1;
                    }

                    return presence.game.name;
                }

                function getAppDetails(presence) {	
                    if (!presence.game || !presence.game.details) {
                        return -1;
                    }

                    return presence.game.details;
                }

                return {
                    name: user.username,
                    app_name: getAppName(user.presence),
                    app_details: getAppDetails(user.presence)
                }
            }
        )

        this._messages = new InfluxTable(this,
            'messages',
            message => {
                return {
                    author_id: message.author.id,
                    guild_id: message.channel.guild.id
                };
            },
            message => {
                return {
                    channel: message.channel.name,
                    guild: message.channel.guild.name,
                    message: 'N' + message.content.replace(/\n/gm, '\\n') /* escape newlines cause node-influxdb does not */
                };
            },
            message => message.createdTimestamp
        );
    }

    configure(options) {
        if (!options.host) {
            throw new Error('`options.host` not set.');
        }

        /* initialize influx db connection */
        this.client = new influx.InfluxDB({
            database: 'dong',
            host: options.host,
            port: options.port,
            username: options.username,
            password: options.password,
            schema: [
                {
                    measurement: 'messages',
                    tags: [
                        'channel',
                        'guild',
                        'message' /* make sure last, to reduce escaping problems when making query */
                    ],
                    fields: {
                        author_id: influx.FieldType.INTEGER,
                        guild_id: influx.FieldType.INTEGER
                    }
                },
                {
                    measurement: 'users',
                    tags: [
                        'name',
                        'app_name',
                        'app_details'
                    ],
                    fields: {
                        user_id: influx.FieldType.INTEGER,
                        app_id: influx.FieldType.INTEGER,
                        status: influx.FieldType.INTEGER
                    }
                },
                {
                    measurement: 'guilds',
                    tags: [
                        'name'
                    ],
                    fields: {
                        guild_id: influx.FieldType.INTEGER
                    }
                }
            ]
        });
    }

    start() {
        let self = this;
        
        /* wipe database, cause we madlads */
        return new Promise((resolve, reject) => {	
            /*
            self.client.dropDatabase('dong').then(() => {
                self.client.createDatabase('dong')
                    .then(() => resolve())
                    .catch((err) => reject(err));
            }).catch((err) => reject(err));
            */
            resolve();
        });
    }

    get guilds() {
        return this._guilds;
    }

    get messages() {
        return this._messages;
    }

    get users() {
        return this._users;
    }
}

module.exports = InfluxDatabase;