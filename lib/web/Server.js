const express = require('express');
const fs = require('fs');

const log = require('../log');

/**
 * Represents a dong server.
 */
class Server {

    /**
     * Constructs a new instance of the Server
     * class.
     */
    constructor() {
        /**
         * Configuration of the Server instance.
         */
        this.config = {
            hostname: 'localhost',
            port: 8080,
            log: {
                level: 'info',
                filename: 'dong.server.log'
            },
            db: {
                host: 'localhost',
                port: 8086,
                username: '',
                password: ''
            }
        }

        /**
         * Logger of the Server instance.
         */
        this.logger = new log.WinstonLogger('server');
        this.logger.configure(this.config.log); /* use default config */

        /**
         * Express application of the Server instance.
         */
        this.app = express()
        this.app.get('/', function(req, res) {
            res.send('Hello world');
        });
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
        this.logger.configure(config.log);
    }

    /**
     * Starts listening.
     * @returns {Pormise<void>}
     */
    start(port, hostname) {
        port = port || this.config.port;
        hostname = hostname || this.config.hostname;

        return new Promise((resolve, reject) => {
            this.app.listen(port, hostname, () => {
                resolve();
            });
        });
    }
}

module.exports = Server;