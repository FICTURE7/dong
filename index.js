const dong = require('dong');

let bot = new dong.Bot();
let web = new dong.Server();

/* configure the bot & the server */
bot.configure('dong.bot.config');
web.configure('dong.server.config');

/* start web server & bot */
web.start()
    .then(() => web.logger.info('Started...'))
    .catch(err => web.logger.error('Failed to start: ', err));
bot.start()
    .then(() => bot.logger.info('Started...'))
    .catch(err => bot.logger.error('Failed to start: ', err));