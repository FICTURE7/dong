const fs = require('fs');
const winston = require('winston');
const discord = require('discord.js');

const EventEmitter = require('events');
const Handler = require('./Handler');
const InfluxDatabase = require('./InfluxDatabase');

/**
 * Represents a dong instance.
 */
class Dong extends EventEmitter {
    
    /**
     * Constructs a new instance of the Dong
     * class.
     * @constructs Dong
     */
    constructor() {	
        super();

        /**
         * Configuration of the Dong instance.
         * @member Dong#config
         */
        this.config = {
            interval: 1000,
            token: undefined,
            debug: false,
            log: 'info',
            db: {
                host: "localhost",
                port: 8086,
                username: "",
                password: ""
            }
        };

        /**
         * Handler of the Dong instance.
         * @member Dong#handler
         */
        this.handler = new Handler(this);

        /**
         * Database connection/driver of the Dong instance.
         * @member Dong#db
         */
        this.db = new InfluxDatabase();

        /**
         * Commands of the Dong instance.
         * @member Dong#commands
         */
        this.commands = {};

        /**
         * Logger of the Dong instance.
         * @member Dong#logger
         */
        this.logger = winston.createLogger({
            level: this.config.log,
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.timestamp(),
                winston.format.splat(),
                winston.format.printf(info => {
                    return `${info.timestamp} [${info.level}]: ${info.message}`
                })
            ),
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({ filename: 'dong.log' })
            ]
        });

        /**
         * Discord client instance of the Dong instance.
         * @member Dong#client
         */
        this.client = null;
    }

    /**
     * Configures the Dong instance using the json file at the specified
     * path
     * @param {string} path Path to json configuration file.
     * @throws {Error} File does not exists or `config.token` was not set.
     */
    configure(path) {
        /* make sure the file exists */
        if (!fs.existsSync(path)) {
            throw new Error('File does not exists.');
        }

        /* load the json config file */
        let configData = fs.readFileSync(path);
        let config = JSON.parse(configData);
        
        /* warn user incase `db` object was not set in config */
        if (!config.db) {
            this.logger.warn('`db` object in configuration file was not set, using default.');
        }

        /* merge default config with the json config */
        this.config = Object.assign({}, this.config, config);

        /* make sure a token was set in the config file */
        if (!this.config.token) {	
            throw new Error('Token was not configured in the configuration file.');
        }

        /* configure the tranport to use the level specified in the config file */
        for (let key in this.logger.transports) {
            this.logger.transports[key].level = this.config.log;
        }

        /* configure the database driver */
        this.db.configure(this.config.db);
    }

    /**
     * Starts the bot.
     * @throws {Error} `config.token` was not set.
     */
    start() {
        /* check if token was configured */
        if (!this.config.token) {
            throw new Error('Token was not configured in `config.token`.');
        }

        let db = this.db;
        let config = this.config;

        /* initialize discord client & set event handlers */
        this.client = new discord.Client();
        this.client.on('ready', () => this.handler.onReady());
        this.client.on('error', (error) => this.handler.onError(error));
        this.client.on('warn', (warn) => this.handler.onWarn(warn));
        this.client.on('message', (message) => this.handler.onMessage(message));

        let client = this.client;
        return new Promise((resolve, reject) => {
            db.start().then(() => {
                /* 
                 * login into discord account once,
                 * the db has been started.
                 */
                client.login(config.token).catch(err => reject(err));
            }).catch(err => reject(err));
        });
    }

    /**
     * Stops the bot.
     */
    stop() {
        this.client.destroy();
    }
}

/* export the goods */
module.exports = {
    Dong: Dong
}
