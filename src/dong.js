"use strict";

const fs = require('fs');
const winston = require('winston');
const discord = require('discord.js');

const Handler = require('./handler');
const Command = require('./command');
const CommandHandler = require('./command-handler');

class Dong {

	constructor() {	
		/* default configuration of the bot */
		this.config = {
			token: undefined,
			debug: false,
			log: 'info'
		};

		this.commands = new CommandHandler();
		this.handler = new Handler(this);

		/* configure logger */
		this.logger = winston.createLogger({
			level: this.config.log,
			format: winston.format.combine(
				winston.format.colorize(),
				winston.format.timestamp(),
				winston.format.printf(info => `${info.timestamp} [${info.level}]: ${info.message}`)
			),
			transports: [
				new winston.transports.Console(),
				new winston.transports.File({ filename: 'dong.log' })
			]
		});

		this.client = null;
	}

	configure(path) {
		/* make sure the file exists */
		if (!fs.existsSync(path)) {
			throw new Error('File does not exists.');
		}

		/* load the json config file */
		let configData = fs.readFileSync(path);
		let config = JSON.parse(configData);

		this.config = {
			token: config.token,
			debug: config.debug || this.config.debug,
			log: config.log || this.config.log
		};

		/* make sure a token was set in the config file */
		if (!this.config.token) {	
			throw new Error('Token was not configured in the configuration file.');
		}

		/* configure the tranport to use the level specified in the config file */
		for (let key in this.logger.transports) {
			this.logger.transports[key].level = this.config.log;
		}
	}

	start() {
		/* check if token was configured */
		if (!this.config.token) {
			throw new Error('Token was not configured in `config.token`.');
		}

		/* initialize discord client & set event handlers */
		this.client = new discord.Client();
		this.client.on('ready', () => this.handler.onReady());
		this.client.on('error', (error) => this.handler.onError(error));
		this.client.on('warn', (warn) => this.handler.onWarn(warn));

		/* starts the bot */
		this.client.login(this.config.token);
	}

	stop() {
		this.client.destroy();
	}
}

/* export the goods */
module.exports = {
	Dong: Dong,
	Command: Command
}
