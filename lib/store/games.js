const {Chess} = require('../../node_modules/chess.js/chess');
const image = require('../image');
const knexfile = require('../../knexfile.js');
const knex = require('knex')(knexfile);
const Player = require('./players');

const active = new Map([]);
const all = '*';
const Game = knex('games').select(all);

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
    chess.image = image;
    chess.players = randomColor(player1, player2);
    return knex('games')
        .insert({
            ...chess.players,
            fen: chess.fen(),
            pgn: chess.pgn()
        })
        .then(([id]) => {
            chess.id = id;
            active.set(id, chess);
            active.set(player1, chess);
            active.set(player2, chess);
            return bluebird.all([
                Player.upsert(player1, {playing: true}),
                Player.upsert(player2, {playing: true})
            ]);
        })
        .then(() => chess);
};

const get = id =>
    Game.where({id})
        .then(result => result.length > 1 ? result[0] : []);

const update = chess =>
    Game.where('id', chess.id)
        .update({
            id: chess.id,
            fen: chess.fen(),
            pgn: chess.pgn(),
            winner: chess.winner,
            reason: chess.reason
        })
        .exec();

const complete = (chess) =>
    update(chess)
        .then(() => {
            if (chess.winner === chess.player.white) {
                Player.win(chess.player.white);
            } else {
                Player.win(chess.player.black);
            }
        });

module.exports = {
    active,
    complete,
    create,
    get,
    update,
};
