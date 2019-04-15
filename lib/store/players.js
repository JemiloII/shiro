const knexfile = require('../../knexfile.js');
const knex = require('knex')(knexfile);

const all = '*';
const Player = knex('games').select(all);

const get = id =>
    Player.where({id})
        .then(result => result.length > 1 ? result[0] : []);

const isPlaying = id =>
    Player.where({id})
        .then(result => result.length > 1 ? result[0].playing : false);

const upsert = async (id, player) => {
    const result = await get(id);

    if (result.length === 0) {
        await Player.insert({id}).exec();
    }

    return Player.where({id})
        .update(player)
        .exec();
};

const draw = async id => {
    const player = get(id);
    return upsert(id, {draw: ++player.draw, playing: false});
};

const lose = async id => {
    const player = get(id);
    return upsert(id, {lose: ++player.lose, playing: false});
};

const win = async id => {
    const player = get(id);
    return upsert(id, {win: ++player.win, playing: false});
};

module.exports = {
    get,
    isPlaying,
    upsert,
    draw,
    lose,
    win
};
