const text2png = require('text2png');
const Chess = require('chess.js').Chess;
const chess = new Chess();

const characters = {
    'kww': '\uE040',
    'qww': '\uE041',
    'rww': '\uE042',
    'bww': '\uE043',
    'nww': '\uE044',
    'pww': '\uE045',
    'kbw': '\uE046',
    'qbw': '\uE047',
    'rbw': '\uE048',
    'bbw': '\uE049',
    'nbw': '\uE04A',
    'pbw': '\uE04B',
    'w'  : '\uE04C',
    'kwb': '\uE050',
    'qwb': '\uE051',
    'rwb': '\uE052',
    'bwb': '\uE053',
    'nwb': '\uE054',
    'pwb': '\uE055',
    'kbb': '\uE056',
    'qbb': '\uE057',
    'rbb': '\uE058',
    'bbb': '\uE059',
    'nbb': '\uE05A',
    'pbb': '\uE05B',
    'b'  : '\uE05C'
};

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
