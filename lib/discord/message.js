const logger = require('../common/logger');
const initializeMatch = require('./initializeMatch');
const move = require('./move');

const message = (message) => {
    const {author, content} = message;
    if (author.bot) {
        return;
    }

    let input;
    switch(true) {
        case /^c |^challenge /i.test(content):
            return initializeMatch(message)
                .catch(logger.error);
        case /^\|g |^g |^m |^move /i.test(content):
            input = content.replace(/^\|g |^g |^m |^move /i, '');
            return move(message, input)
                .catch(logger.error);
        case /^fen/i.test(content):
            input = content.replace(/^fen|^fen /i, '');
            return fen(message, input);
        case /^pgn/i.test(content):
            input = content.replace(/^pgn|^pgn /i, '');
            return pgn(message, input);
        default:
            return;
    }
};

module.exports = message;
