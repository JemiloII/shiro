const {Chess} = require('chess.js');
const knexfile = require('../knexfile.js');
const knex = require('knex')(knexfile);

const active = new Map([]);
const all = '*';
const Games = knex('games').select(all);

const randomColor = (player1, player2) => {
    if (Math.random() > 0.5) {
        return {
            black: player2,
            white: player1
        };
    }
    return {
        black: player1,
        white: player2
    };
};

const create = (player1, player2) => {
    const chess = new Chess();
    chess.players = randomColor(player1, player2);
    return knex('games')
        .insert({
            ...chess.players,
            fen: chess.fen(),
            pgn: chess.pgn()
        }, 'id')
        .then(id => {
            chess.id = id;
            active.set(id, chess);
            active.set(player1, chess);
            active.set(player2, chess);
            return chess;
        });
};

const get = id =>
    Games.where({id})
        .then(result => result.length > 1 ? result[0] : []);

const update = (game) =>
    Games.where('id', game.id)
        .update(game)
        .exec();

module.exports = {
    active,
    get,
    update,
    create
};
