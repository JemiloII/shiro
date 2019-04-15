const knexfile = require('../../knexfile.js');
const knex = require('knex')(knexfile);

const all = '*';
const Players = knex('games').select(all);

const get = id =>
    Players.where({id})
        .then(result => result.length > 1 ? result[0] : []);

const isPlaying = id =>
    Players.where({id})
        .then(result => result.length > 1 ? result[0].playing : false);

const upsert = async (id, player) => {
    const result = await get(id);

    if (result.length === 0) {
        await Players.insert({id}).exec();
    }

    return Players.where({id})
        .update(player)
        .exec();
};

module.exports = {
    get,
    isPlaying,
    upsert
};
