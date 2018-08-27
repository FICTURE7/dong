const dong = require('dong');

let bot = new dong.Bot();
let web = new dong.Server();

/* configure the bot */
bot.configure('dong.config');

/* start the bot */
/*
bot.start().then(() => {
    bot.logger.info('dong started!');
}).catch((err) => {
    bot.logger.error('dong failed to start!');
});
*/