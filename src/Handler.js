const flatten = require('array-flatten')

class Handler {

	constructor(dong) {
		if (!dong) {
			throw new Error('`dong` must be specified.');
		}

		this.dong = dong;
	}

	onReady() {	
		let dong = this.dong;
		/* snap the guilds & their members */
		function snapGuilds(guilds) {
			for (let guild of guilds.values()) {
				dong.logger.debug(`snapping guild ${guild.name}...`);
				dong.db.guilds.add(guild).catch(err => {
					dong.logger.error('failed to add guild', err);
				});

				/* 
				 * fetchMembers if the guild is considered large,
				 * that is, it has more than 249 members
				 */
				if (guild.large) {
					dong.logger.debug(`fetching guild members ${guild.name}...`);

					guild.fetchMembers().then(guild => {
						snapMembers(guild.members);
					}).catch(err => {
						dong.logger.error(`failed to fetchMembers ${guild.name}`, err);
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
							dong.logger.error('failed to fetchMessages %s', err);
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
				dong.logger.debug(`snapping member ${member.user.username}...`);
				dong.db.users.add(member.user).catch(err => {
					dong.logger.error('failed to add member %s', err);
				});
			}
		}

		/* snap the messages */
		function snapMessages(messages) {
			dong.logger.info(`snapping ${messages.length} messages...`);
			dong.db.messages.addAll(messages).catch(err => {
				dong.logger.error('failed to add message %s', err);
			});
		}

		dong.logger.info('onReady');
		/* snap all the guilds including their members at the current time */
		snapGuilds(dong.client.guilds);
	}

	onError(error) {
		this.dong.logger.error('Dong: onError', error);
	}

	onWarn(warn) {
		this.dong.logger.warn('Dong: onWarn', warn);
	}

	onMessage(message) {
		this.dong.logger.debug('message: %s', message.content);
	}
}

module.exports = Handler;
