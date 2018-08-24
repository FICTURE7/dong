class Handler {

	constructor(dong) {
		if (!dong) {
			throw new Error('`dong` must be specified.');
		}

		this.dong = dong;
	}

	onReady() {
		this.dong.logger.info('Dong: onReady');	
	}

	onError(error) {
		this.dong.logger.error('Dong: onError', error);
	}

	onWarn(warn) {
		this.dong.logger.error('Dong: onWarn', warn);
	}
}

module.exports = Handler;
