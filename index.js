const characters = require('./lib/json/characters');
const legend = require('./lib/json/legend');
const text2png = require('text2png');
const Chess = require('chess.js').Chess;
const chess = new Chess();

const getChar = ({type, color, tile}) => type && color ? characters[`${type}${color}${tile}`] : characters[tile];

const tileColor = (ri, ci) => (ri + ci) % 2 === 0 ? 'w' : 'b';
const tileBoard = (r, ri) => r.map((c, ci) => ({...c, tile: tileColor(ri, ci)}));
const charBoard = r => r.map(c => getChar(c));
const addLegend = (r, ri) => r.concat(legend.rows[ri]);
const tiledBoard = chess.board().map(tileBoard);
const characterBoard = tiledBoard.map(charBoard).map(addLegend).concat(legend.cols);
const boardToString = board => board.map(r => r.join('')).join('\n');
console.log(characterBoard);
console.log(boardToString(characterBoard));

const image = text2png(boardToString(characterBoard), {
    font: '50px Shiro',
    lineSpacing: 0,
    padding: 0,
    bgColor: 'white',
    localFontPath: './assets/shiro1.otf',
    localFontName: 'Shiro',
    output: 'dataURL'
});

console.log(image);
