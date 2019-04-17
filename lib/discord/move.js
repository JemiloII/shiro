const active = require('../store/active');
const {update} = require('../store/games');

const getTurnColor = chess => chess.turn() === 'w' ? 'white' : 'black';

const checkGameOver = (chess, player) => {
    let message = false;
    if (chess.in_draw()) {
        chess.winner = 'draw';
        message = `<@${chess.players.white}> has drew against <@${chess.players.black}>`;
    }

    if (chess.in_stalemate()) {
        chess.winner = 'stalemate';
        message = `<@${chess.players.white}> has stalemated against <@${chess.players.black}>`;
    }

    if (chess.game_over()) {
        chess.winner = player;
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

    return message.channel.send(`It\'s your turn <@${chess.players[color]}>`, {file});
};

module.exports = move;
