const dong = require('./src/dong');

const bot = new dong.Dong();
/* configure the bot & run it */
bot.configure('dong.config');
bot.start();
