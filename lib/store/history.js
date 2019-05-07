const active = require('./active');
const games = require('./games');

const getActiveMatch = message => {
    const {author: {id: authorId}, channel: {id: channelId, guild: {id: guildId}}} = message;
    return active.get(guildId, channelId, authorId);
};

const fen = async (message, input) => {
    const id = Number(input);
    if (!Number.isNaN(id)) {
        const {fen} = await games.get(id);
        return fen;
    }
    const chess = getActiveMatch(message);
    return chess ? chess.fen() : undefined;
};

const pgn = async (message, input) => {
    const id = Number(input);
    if (!Number.isNaN(id)) {
        const {pgn} = await games.get(id);
        return pgn;
    }
    const chess = getActiveMatch(message);
    return chess ? chess.pgn() : undefined;
};

module.exports = {
    fen,
    pgn
};
