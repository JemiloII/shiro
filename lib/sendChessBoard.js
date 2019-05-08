const getTurnColor = chess => chess.turn() === 'w' ? 'white' : 'black';

const sendChessBoard = async (chess, send) => {
    const color = getTurnColor(chess);
    const file = await chess.image();

    return send(`GameId: ${chess.id}\nIt\'s your turn <@${chess.players[color]}>~`, {file});
};

module.exports = {
    getTurnColor,
    sendChessBoard
};
