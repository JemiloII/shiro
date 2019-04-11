const characters = require('./lib/json/characters');
const legend = require('./lib/json/legend');
const text2png = require('text2png');
const Chess = require('chess.js').Chess;
const chess = new Chess();
const Jimp = require('jimp');

chess.move('e4');

const text2pngOpts = {
    font: '62.5px Shiro',
    lineSpacing: 0,
    padding: 0,
    bgColor: 'white',
    localFontPath: './assets/shiro.otf',
    localFontName: 'Shiro',
    output: 'buffer'
};

const getChar = ({type, color, tile}) => type && color ? characters[`${type}${color}${tile}`] : characters[tile];

const tileColor = (ri, ci) => (ri + ci) % 2 === 0 ? 'w' : 'b';
const tileBoard = (r, ri) => r.map((c, ci) => ({...c, tile: tileColor(ri, ci)}));
const charBoard = r => r.map(c => getChar(c));
const tiledBoard = chess.board().map(tileBoard);
const characterBoard = tiledBoard.map(charBoard);
const boardToString = board => board.map(r => r.join('')).join('\n');
console.log(characterBoard);
const text = boardToString(characterBoard);

const chessBoard = text2png(text, text2pngOpts);

const generate = async (buffer) => {
    const base = await Jimp.read('./assets/base.png');
    const board = await Jimp.read(buffer);

    base.blit(board, 0, 0);
    return await base.getBase64Async('image/png');
};

generate(chessBoard)
    .then(console.log);
