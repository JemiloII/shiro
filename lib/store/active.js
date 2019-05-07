const active = new Map();

const getMap = (map, id) => {
    let getMap = map.get(id);
    if (!getMap) {
        getMap = new Map();
        map.set(id, getMap);
    }
    return getMap;
};

const getChannelMap = (guildId, channelId) => {
    const guildMap = getMap(active, guildId);
    return getMap(guildMap, channelId);
};

const get = (guildId, channelId, playerId) => {
    const channelMap = getChannelMap(guildId, channelId);
    return channelMap.getMap(playerId);
};

const has = (guildId, channelId, playerId) => {
    const channelMap = getChannelMap(guildId, channelId);
    return channelMap.has(playerId);
};

const set = (guildId, channelId, playerId, chess) => {
    const channelMap = getChannelMap(guildId, channelId);
    channelMap.set(playerId, chess);
    return active;
};

const remove = (guildId, channelId, playerId) => {
    const channelMap = getChannelMap(guildId, channelId);
    return channelMap.delete(playerId);
};

module.exports = {
    delete: remove,
    get,
    has,
    raw: active,
    set
};
