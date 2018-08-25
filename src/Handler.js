class Handler {

	constructor(dong) {
		if (!dong) {
			throw new Error('`dong` must be specified.');
		}

		this.dong = dong;
	}

	onReady() {
		let self = this;
		self.dong.logger.info('Dong: onReady');	

		let guild = self.dong.client.guilds.array()[0];
		let channel = guild.channels.find((channel) => {
			return channel.name === 'general' && channel.type === 'text';
		});

		channel.fetchMessages().then((messages) => {
			console.log(messages.size);
			messages.forEach((message) => {
				console.log(`${message.createdAt} - ${message.id}`);

				self.dong.db.client.writePoints([{
					measurement: 'messages',
					timestamp: message.createdTimestamp,
					tags: {
						message: message.content || "EMPTY",
						channel: message.channel.name,
						guild: message.channel.guild.name
					},
					fields: { 
						author_id: message.author.id,
						channel_id: message.channel.id,
						guild_id: message.channel.guild.id
					}
				}]);
			});
		});
	}

	onError(error) {
		this.dong.logger.error('Dong: onError', error);
	}

	onWarn(warn) {
		this.dong.logger.warn('Dong: onWarn', warn);
	}

	onMessage(message) {
		this.dong.logger.info('message: %s', message.content);

	}
}

module.exports = Handler;
