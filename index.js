const dong = require('./src/Dong');

const bot = new dong.Dong();
/* configure the bot */
bot.configure('dong.config');
/* start the bot */
bot.start().then(() => {
	bot.logger.info('dong started!');
}).catch((err) => {
	bot.logger.error('dong failed to start!');
});
