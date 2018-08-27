const flatten = require('array-flatten')

/**
 * Represents the handler where all the magic happens.
 */
class Handler {

    /**
     * Constructs a new instance of the Handler
     * class.
     * @param {Bot} bot 
     */
    constructor(bot) {
        if (!bot) {
            throw new Error('`dong` must be specified.');
        }

        /**
         * Bot instance the Handler is working with.
         */
        this.bot = bot;
    }

    /**
     * Callback when ready.
     */
    onReady() {	
        let bot = this.bot;
        /* snap the guilds & their members */
        function snapGuilds(guilds) {
            for (let guild of guilds.values()) {
                bot.logger.debug(`snapping guild ${guild.name}...`);
                bot.db.guilds.add(guild).catch(err => {
                    bot.logger.error('failed to add guild', err);
                });

                /* 
                 * fetchMembers if the guild is considered large,
                 * that is, it has more than 249 members
                 */
                if (guild.large) {
                    bot.logger.debug(`fetching guild members ${guild.name}...`);

                    guild.fetchMembers().then(guild => {
                        snapMembers(guild.members);
                    }).catch(err => {
                        bot.logger.error(`failed to fetchMembers ${guild.name}`, err);
                    });
                } else {
                    snapMembers(guild.members);
                }

                /* snap all messages in the text channels of the guild */
                for (let channel of guild.channels.values()) {
                    if (channel.type !== 'text') {
                        continue;
                    }

                    let allMessages = [];

                    /* flushes messages back to database */
                    function flushMessages() {
                        let tmp = flatten(allMessages);

                        allMessages = [];
                        snapMessages(tmp);
                    }

                    function fetchAllMessages(id) {
                        let options = {}
                        if (id) {
                            options.before = id;
                        }

                        channel.fetchMessages(options).then((messages) => {
                            /* exit if no more messages */
                            if (messages.size === 0) {
                                flushMessages();
                                return;
                            }

                            /* add to array of messages */
                            allMessages.push(messages.array());
                            /* if we got around 500 array of messages in the array then push to db */
                            if (allMessages.length >= 5000 / 50) {
                                flushMessages();
                            }

                            /* keep fetching messages */
                            fetchAllMessages(messages.lastKey());
                        }).catch(err => {
                            bot.logger.error('failed to fetchMessages %s', err);
                        });
                    }

                    /* fetch all messages recursively */
                    fetchAllMessages();
                }
            }
        }

        /* snap the members */
        function snapMembers(members) {
            for (let member of members.values()) {
                bot.logger.debug(`snapping member ${member.user.username}...`);
                bot.db.users.add(member.user).catch(err => {
                    bot.logger.error('failed to add member %s', err);
                });
            }
        }

        /* snap the messages */
        function snapMessages(messages) {
            bot.logger.info(`snapping ${messages.length} messages...`);
            bot.db.messages.addAll(messages).catch(err => {
                bot.logger.error('failed to add message %s', err);
            });
        }

        bot.logger.info('onReady');
        /* snap all the guilds including their members at the current time */
        snapGuilds(bot.client.guilds);
    }

    /**
     * Callback when an error occured.
     * @param {*} error 
     */
    onError(error) {
        this.bot.logger.error('Dong: onError', error);
    }

    /**
     * Callback when a warning was received.
     * @param {*} warn 
     */
    onWarn(warn) {
        this.bot.logger.warn('Dong: onWarn', warn);
    }

    /**
     * Callback when a message was received.
     * @param {*} message 
     */
    onMessage(message) {
        this.bot.logger.debug('message: %s', message.content);
    }
}

module.exports = Handler;
