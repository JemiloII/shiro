const active = require('../store/active');
const {update} = require('../store/games');

const getTurnColor = chess => chess.turn() === 'w' ? 'white' : 'black';

const checkGameOver = (chess, player) => {
    let message = false;
    chess.winner = '';

    if (chess.in_draw()) {
        chess.winner = 'draw';
        chess.reason = 'draw';
        message = `<@${chess.players.white}> has drew against <@${chess.players.black}>`;
    }

    if (chess.in_stalemate()) {
        chess.winner = 'draw';
        chess.reason = 'stalemate';
        message = `<@${chess.players.white}> has stalemated against <@${chess.players.black}>`;
    }

    if (chess.insufficient_material()) {
        chess.winner = 'draw';
        chess.reason = 'insufficient material';
        message = `<@${chess.players.white}> has drew against <@${chess.players.black}> due to insufficient material.`;
    }

    if (chess.in_threefold_repetition()) {
        chess.winner = 'draw';
        chess.reason = 'in threefold repetition';
        message = `<@${chess.players.white}> has drew against <@${chess.players.black}> in a threefold repetition.`;
    }

    if (chess.game_over()) {
        chess.winner = player;
        chess.reason = 'checkmate';
        message = `Hooray! <@${player}> has won!`;
    }

    if (message) {
        update(chess);
        active.delete(chess.guildId, chess.channelId, chess.players.black);
        active.delete(chess.guildId, chess.channelId, chess.players.white);
    }

    return message;
};

const move = async (message, input) => {
    const {author, channel: {id: channelId, guild: {id: guildId}}} = message;
    const chess = active.get(guildId, channelId, author.id);
    if (!chess.players[getTurnColor(chess)] === author.id) {
        return;
    }

    chess.move(input);
    const isGameOver = checkGameOver(chess, author);
    if (isGameOver) {
        return message.channel.send(isGameOver);
    }

    const color = getTurnColor();
    const file = await chess.image();

    return message.channel.send(`GameId: ${chess.id}\nIt\'s your turn <@${chess.players[color]}>~`, {file});
};

module.exports = move;
