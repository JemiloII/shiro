const load = require('stockfish/load_engine');
const stockfish = load();

const send = cmd => {
    return new Promise((resolve, reject) => {
        try {
            stockfish.send(cmd, resolve);
        } catch (error) {
            reject(error);
        }
    });
};

const bestmove = async (fen) => {
    send('ucinewgame');
    send(`position fen ${fen}`);
    const result = await send(`go depth 15`);
    return result.split(' ')[1];
};

module.exports = {
    bestmove
};
