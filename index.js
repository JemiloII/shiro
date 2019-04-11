const characters = require('./lib/json/characters');
const legend = require('./lib/json/legend');
const text2png = require('text2png');
const Chess = require('chess.js').Chess;
const chess = new Chess();
const Jimp = require('jimp');

const fontSize = 62.5;
const text2pngOpts = {
    font: `${fontSize}px Shiro`,
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
// const addLegend = (r, ri) => r.concat(legend.rows[ri]);
const tiledBoard = chess.board().map(tileBoard);
const characterBoard = tiledBoard.map(charBoard); //.map(addLegend).concat(legend.cols);
const boardToString = board => board.map(r => r.join('')).join('\n');
console.log(characterBoard);
const text = boardToString(characterBoard);

const chessBoard = text2png(text, text2pngOpts);

console.log(chessBoard);

const dimension = fontSize * 9;
new Jimp(dimension, dimension, async (error, image) => {
    try {
        const board = await Jimp.read(chessBoard);
        console.log(await board.getBase64Async('image/png'));
    } catch (e) {
        console.log('Caught Jimp Error:', e);
    }
});
