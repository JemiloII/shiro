const characters = require('./lib/json/characters');
const text2png = require('text2png');
const Chess = require('chess.js').Chess;
const chess = new Chess();

const getChar = ({type, color, tile}) => type && color ? characters[`${type}${color}${tile}`] : characters[tile];

const tileColor = (ri, ci) => (ri + ci) % 2 === 0 ? 'w' : 'b';
const tileBoard = (r, ri) => r.map((c, ci) => ({...c, tile: tileColor(ri, ci)}));
const charBoard = r => r.map(c => getChar(c));
const tiledBoard = chess.board().map(tileBoard);
const characterBoard = tiledBoard.map(charBoard);

const boardToString = board => board.map(r => r.join('')).join('\n');

const image = text2png(boardToString(characterBoard), {
    font: '50px Chess',
    lineSpacing: 0,
    padding: 0,
    bgColor: 'white',
    localFontPath: './assets/chess.otf',
    localFontName: 'Chess',
    output: 'dataURL'
});

console.log(image);