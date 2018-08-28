const Bot = require('./bot');
const Server = require('./web');

const db = require('./db');
const log = require('./log');

module.exports = {
    Bot: Bot,
    Server: Server,

    db: db,
    log: log
};