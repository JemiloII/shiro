const Jimp = require('jimp/jimp');
const text2png = require('text2png');
const characters = require('./json/characters');

const findChars = ({type, color, tile}) => type && color ? characters[`${type}${color}${tile}`] : characters[tile];
const tileColor = (ri, ci) => (ri + ci) % 2 === 0 ? 'w' : 'b';
const tileBoard = (r, ri) => r.map((c, ci) => ({...c, tile: tileColor(ri, ci)}));
const charBoard = r => r.map(c => findChars(c));
const mergeList = r => r.join('');

const generate = async (buffer) => {
    const base = await Jimp.read('./assets/base.png');
    const board = await Jimp.read(buffer);

    base.blit(board, 63, 0);
    return await base.getBufferAsync('image/png');
};

function image(chess = this) {
    const board = chess.board()
        .map(tileBoard)
        .map(charBoard)
        .map(mergeList)
        .join('\n');

    const buffer = text2png(board, {
        font: '62.5px Shiro',
        lineSpacing: 0,
        padding: 0,
        bgColor: 'white',
        localFontPath: './assets/shiro.otf',
        localFontName: 'Shiro',
        output: 'buffer'
    });

    return generate(buffer);
}

module.exports = image;
