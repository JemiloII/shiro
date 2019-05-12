const active = require('./store/active');
const {process} = require('./gameover');
const {bestmove} = require('./npc');
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

    if (chess.players[getTurnColor(chess)] === message.client.user.id) {
        await sendChessBoard(message, chess);

        const npcMove = await bestmove(chess.fen());
        await message.channel.send(`move ${npcMove}`);
        chess.move(npcMove, {sloppy: true});

        if (chess.game_over()) {
            return process(chess, message.client.user, message.channel.send);
        }
        return sendChessBoard(message, chess);
    }

    return sendChessBoard(message, chess);
};

module.exports = move;
