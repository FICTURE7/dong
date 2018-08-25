const dong = require('./src/Dong');

const bot = new dong.Dong();
/* configure the bot & run it */
bot.configure('dong.config');
bot.start();
