const express = require('express');

/**
 * Represents a dong server.
 */
class Server {

    /**
     * Constructs a new instance of the Server
     * class.
     */
    constructor() {
        this.app = express()
        this.app.get('/', function(req, res) {
            res.send('Hello world');
        });
    }

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
    }

    /**
     * Starts listening.
     * @returns {Pormise<void>}
     */
    listen(port = undefined, hostname = undefined) {
        return new Promise((resolve, reject) => {
            this.app.listen(port, hostname, () => {
                resolve();
            });
        });
    }
}

module.exports = Server;