const {active, create} = require('./store/games');
const {sendChessBoard} = require('./sendChessBoard');

const yes = '📗';
const no = '📕';

const filter = opponentId => (reaction, user) => (reaction.emoji.name === yes || reaction.emoji.name === no) && user.id === opponentId;

const challengeOpponent = async (author, opponent) => {
    const {channel} = author.lastMessage;
    const reply = await channel.send(`${opponent}, do you accept the challenge from ${author}?`);
    await reply.react(yes);
    await reply.react(no);

    const reactions = await reply.awaitReactions(filter(opponent.id), {time: 15000, max: 1});

    switch(reactions.firstKey()) {
        case yes:
            return undefined;
        case no:
            return `your challenge was rejected by ${opponent}`;
        default:
            return `your challenge was not noticed by ${opponent}`;
    }
};

const checkNewMatch = async (author, opponent) => {
    const {lastMessage: {channel: {id: channelId, guild: {id: guildId}}}} = author;
    switch(true) {
        case author.id === opponent.id:
            return `You can't challenge yourself!`;
        case !opponent.id:
            return 'Player not found!';
        case await isPlaying(author.id, channelId, guildId):
            return 'Currently, you can only play on game at a time in this channel. Please use another channel, complete, or leave your current match first.';
        case await isPlaying(opponent.id, channelId, guildId):
            return 'The player you are challenging is currently in a match. Please wait for their current match to complete or challenge them in another channel.';
        default:
            return '';
    }
};

const initializeMatch = async message => {
    const {author, mentions} = message;

    const newMatchError = await checkNewMatch(message, author, mentions.users.first());
    if (newMatchError) {
        return message.reply(newMatchError);
    }

    const isShiro = message.client.user.id === mentions.users.firstKey();
    const rejected = isShiro ? false : challengeOpponent(author, mentions.users.first());
    if (rejected) {
        return message.reply(rejected);
    }

    const chess = await create(message);
    return sendChessBoard(message, chess);
};

const isPlaying = async (player, channelId, guildId) => {
    const result = await active({playerId: player.id, channelId, guildId});
    return result.length > 1;
};

module.exports = initializeMatch;
