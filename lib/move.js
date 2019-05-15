const ActiveStore = require('./store/active');
const {bestmove} = require('./npc');
const {load} = require('./store/games');
const {process} = require('./gameover');
const {getTurnColor, sendChessBoard} = require('./sendChessBoard');

const moveNpc = async (message, chess) => {
    const npcMove = await bestmove(chess.fen());
    await message.channel.send(`move ${npcMove}`);
    chess.move(npcMove, {sloppy: true});

    if (chess.game_over()) {
        return process(chess, message.client.user, message.channel.send);
    }
    return sendChessBoard(message, chess);
};

const move = async (message, input) => {
    const {author, channel: {id: channelId, guild: {id: guildId}}} = message;
    const chess = ActiveStore.get(guildId, channelId, author.id) || await load(author.id, channelId, guildId);
    if (!chess) {
        message.reply('You do not have an active game in this channel.');
    }

    if (!chess.players[getTurnColor(chess)] === author.id) {
        return;
    }

    chess.move(input);
    if (chess.game_over()) {
        return process(chess, author, message.channel.send);
    }

    if (chess.players[getTurnColor(chess)] === message.client.user.id) {
        await sendChessBoard(message, chess);
        const random = Math.floor(Math.random() * 1000);
        return setTimeout(moveNpc, random, message, chess);
    }

    return sendChessBoard(message, chess);
};

module.exports = move;
