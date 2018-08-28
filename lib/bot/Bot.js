const fs = require('fs');
const winston = require('winston');
const discord = require('discord.js');

const EventEmitter = require('events');
const Handler = require('./Handler');
const InfluxDatabase = require('../db/InfluxDatabase');

const log = require('../log');

/**
 * Represents a Dong bot instance.
 */
class Bot extends EventEmitter {
    
    /**
     * Constructs a new instance of the Bot
     * class.
     */
    constructor() {	
        super();

        /**
         * Configuration of the Bot instance.
         * @member Bot#config
         */
        this.config = {
            interval: 1000,
            token: undefined,
            debug: false,
            log: {
                level: 'info',
                filename: 'dong.bot.log'
            },
            db: {
                host: "localhost",
                port: 8086,
                username: "",
                password: ""
            }
        };

        /**
         * Handler of the Bot instance.
         */
        this.handler = new Handler(this);

        /**
         * Database connection/driver of the Bot instance.
         */
        this.db = new InfluxDatabase();

        /**
         * Commands of the Bot instance.
         */
        this.commands = {};

        /**
         * Logger of the Bot instance.
         */
        this.logger = new log.WinstonLogger('bot');
        this.logger.configure(this.config.db);

        /**
         * Discord client instance of the Bot instance.
         */
        this.client = null;
    }

    /**
     * Configures the Bot instance using the json file at the specified
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

        /* configure the logger */
        this.logger.configure(this.config.log);
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
                 * login into discord account when,
                 * the db has been started.
                 */
                client.login(config.token)
                    .then(() => resolve())
                    .catch(err => reject(err));
            }).catch(err => reject(err));
        });
    }

    /**
     * Stops the bot.
     * @return {Promise<void>}
     */
    destory() {
        return new Promise((resolve, reject) => {
            /*
             * try to destory the client first
             * then destroy the database
             */
            this.client.destroy().then(() => {;
                this.db.destroy()
                    .then(() => resolve())
                    .catch(err => reject(err));
            }).catch(err => reject(err));
        });
    }
}

module.exports = Bot;