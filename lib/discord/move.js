const active = require('../store/active');
const {process} = require('./gameover');
const {getTurnColor, sendChessBoard} = require('./sendChessBoard');

const move = async (message, input) => {
    const {author, channel: {id: channelId, guild: {id: guildId}}} = message;
    const chess = active.get(guildId, channelId, author.id);
    if (!chess.players[getTurnColor(chess)] === author.id) {
        return;
    }

    chess.move(input);
    if (chess.game_over()) {
        return process(chess, author, message.channel.send);
    }

    return sendChessBoard(chess, message.channel.send);
};

module.exports = move;
