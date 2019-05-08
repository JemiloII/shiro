const active = require('../store/active');
const {update} = require('../store/games');

const getTurnColor = chess => chess.turn() === 'w' ? 'white' : 'black';

const getGameOverMessage = (chess, player) => {
    switch (true) {
        case chess.in_draw():
            chess.winner = 'draw';
            chess.reason = 'draw';
            return `<@${chess.players.white}> has drew against <@${chess.players.black}>`;
        case chess.in_stalemate():
            chess.winner = 'draw';
            chess.reason = 'stalemate';
            return `<@${chess.players.white}> has stalemated against <@${chess.players.black}>`;
        case chess.insufficient_material():
            chess.winner = 'draw';
            chess.reason = 'insufficient material';
            return `<@${chess.players.white}> has drew against <@${chess.players.black}> due to insufficient material.`;
        case chess.in_threefold_repetition():
            chess.winner = 'draw';
            chess.reason = 'in threefold repetition';
            return `<@${chess.players.white}> has drew against <@${chess.players.black}> in a threefold repetition.`;
        case chess.game_over():
            chess.winner = player;
            chess.reason = 'checkmate';
            return `Hooray! <@${player}> has won!`;
    }
};

const processGameOver = (chess, player, send) => {
    const reply = getGameOverMessage(chess, player);
    update(chess);
    active.delete(chess.guildId, chess.channelId, chess.players.black);
    active.delete(chess.guildId, chess.channelId, chess.players.white);
    return send(reply);
};

const move = async (message, input) => {
    const {author, channel: {id: channelId, guild: {id: guildId}}} = message;
    const chess = active.get(guildId, channelId, author.id);
    if (!chess.players[getTurnColor(chess)] === author.id) {
        return;
    }

    chess.move(input);
    checkGameOver(chess, author);
    if (chess.game_over()) {
        return processGameOver(chess, author, message.channel.send);
    }

    const color = getTurnColor();
    const file = await chess.image();

    return message.channel.send(`GameId: ${chess.id}\nIt\'s your turn <@${chess.players[color]}>~`, {file});
};

module.exports = move;
