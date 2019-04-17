const active = require('./active');
const {Chess} = require('../../node_modules/chess.js/chess');
const image = require('../image');
const knexfile = require('../../knexfile.js');
const knex = require('knex')(knexfile);
const Player = require('./players');

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

const create = (guildId, channelId, player1, player2) => {
    const chess = new Chess();
    chess.image = image;
    chess.players = randomColor(player1, player2);
    chess.guildId = guildId;
    chess.channelId = channelId;
    return knex('games')
        .insert({
            ...chess.players,
            guildId,
            channelId,
            fen: chess.fen(),
            pgn: chess.pgn()
        })
        .then(([id]) => {
            chess.id = id;
            active.set(guildId, channelId, player1, chess);
            active.set(guildId, channelId, player2, chess);
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
            if (chess.winner === 'draw' || chess.winner === 'stalemate') {
                Player.draw(chess.player.white);
                Player.draw(chess.player.black);
            }

            if (chess.winner === chess.player.white) {
                Player.win(chess.player.white);
                Player.lose(chess.player.black);
            }

            if (chess.winner === chess.player.black){
                Player.win(chess.player.black);
                Player.lose(chess.player.white);
            }
        });

module.exports = {
    complete,
    create,
    get,
    update,
};
