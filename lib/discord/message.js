const logger = require('../common/logger');

const message = (message) => {
    const {author, channel, content} = message;
    logger.debug(`${channel.name}| ${author.username}: ${content}`);
    if (author.bot) {
        return;
    }


};

module.exports = message;