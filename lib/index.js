const bot = require('./bot');
const web = require('./web');
const db = require('./db');

module.exports = {
    Bot: bot,
    Server: web,
    Database: db
};