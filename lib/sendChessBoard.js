const getTurnColor = chess => chess.turn() === 'w' ? 'white' : 'black';

const sendChessBoard = async (message, chess) => {
    const color = getTurnColor(chess);
    const file = await chess.image();

    return message.channel.send(`GameId: ${chess.id}\nIt\'s your turn <@${chess.players[color]}>~`, {file});
};

module.exports = {
    getTurnColor,
    sendChessBoard
};
