const active = require('./active');
const {Chess} = require('chess.js');
const image = require('../image');
const knexfile = require('../../knexfile.js');
const knex = require('knex')(knexfile);
const Player = require('./players');

const all = '*';
const Game = knex('games').select(all);

const setChessHeaders = (chess, player1, player2) => {
    const black = chess.players.black === player1.id ? player1 : player2;
    const white = chess.players.white === player1.id ? player1 : player2;

    chess.header('Bot', 'Shiro');
    chess.header('BotAuthor', 'ShibikoX#1337');

    chess.header('DiscordGuild', chess.guild.name);
    chess.header('DiscordGuildId', chess.guild.id);
    chess.header('DiscordChannel', chess.channel.name);
    chess.header('DiscordChannelId', chess.channel.id);

    chess.header('MatchDate', new Date().toUTCString());
    chess.header('MatchType', 'Ranked');

    chess.header('Black', `${black.username}#${black.discriminator}`);
    chess.header('BlackId', black.id);
    chess.header('White', `${white.username}#${white.discriminator}`);
    chess.header('WhiteId', white.id);
};

const getPlayerColors = (player1, player2) => {
    if (player2.bot || Math.random() > 0.5) {
        return {
            black: player2.id,
            white: player1.id
        };
    }
    return {
        black: player1.id,
        white: player2.id
    };
};

const create = (message) => {
    const {author: player1, mentions, channel: {id: channelId, name: channelName, guild: {id: guildId, name: guildName}}} = message;
    const player2 = mentions.users.first();
    const chess = new Chess();

    chess.image = image;
    chess.channel = {id: channelId, name: channelName};
    chess.guild = {id: guildId, name: guildName};
    chess.players = getPlayerColors(player1, player2);

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
            setChessHeaders(chess, player1, player2);
            active.set(guildId, channelId, player1.id, chess);
            active.set(guildId, channelId, player2.id, chess);
            return Promise.all([
                Player.upsert(player1.id, {playing: true}),
                Player.upsert(player2.id, {playing: true}),
                update(chess)
            ]);
        })
        .then(() => chess);
};

const get = id =>
    Game.where({id})
        .orWhere({channelId: id})
        .orWhere({guildId: id})
        .then(result => result.length > 1 ? result[0] : {});

const update = chess =>
    Game.where('id', chess.id)
        .update({
            id: chess.id,
            fen: chess.fen(),
            pgn: chess.pgn(),
            winner: chess.winner,
            reason: chess.reason
        })
        .then(result => result.length > 1 ? result[0] : {});

const complete = (chess) =>
    update(chess)
        .then(() => {
            if (chess.winner === chess.player.white) {
                Player.win(chess.player.white);
                Player.lose(chess.player.black);
            } else if (chess.winner === chess.player.black){
                Player.win(chess.player.black);
                Player.lose(chess.player.white);
            } else if (chess.winner === 'draw') {
                Player.draw(chess.player.white);
                Player.draw(chess.player.black);
            }
        });

module.exports = {
    complete,
    create,
    get,
    update,
};
