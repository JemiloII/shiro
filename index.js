const image = require('./lib/image');
const Chess = require('chess.js').Chess;
const chess = new Chess();

chess.move('a4');

image(chess)
    .then(console.log);
