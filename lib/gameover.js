const {update} = require('./store/games');

const getMessage = (chess, player) => {
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

const process = (chess, player, send) => {
    const reply = getMessage(chess, player);
    update(chess);
    active.delete(chess.guildId, chess.channelId, chess.players.black);
    active.delete(chess.guildId, chess.channelId, chess.players.white);
    return send(reply);
};

module.exports = {
    getMessage,
    process
};
