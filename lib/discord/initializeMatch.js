const {create} = require('../store/games');
const {isPlaying} = require('../store/players');

const getTurnColor = chess => chess.turn() === 'w' ? 'white' : 'black';

const checkNewMatch = async message => {
    const {author, mentions} = message;

    switch(true) {
        case author.id === mentions.users.firstKey():
            return `You can't challenge yourself!`;
        case !mentions.users.firstKey():
            return 'Player not found!';
        case await isPlaying(author.id):
            return 'Currently, you can only play on game at a time. Please complete or leave your current match first.';
        case await isPlaying(mentions.users.firstKey()):
            return 'The player you are challenging is currently in a match. Please wait for their current match to complete.';
        default:
            return '';
    }
};

const initializeMatch = async message => {
    const {author, mentions} = message;
    const newMatchError = checkNewMatch(message);
    if (newMatchError) {
        return message.reply(newMatchError);
    }

    const yes = '📗';
    const no = '📕';
    const reply = await message.channel.send(`${mentions.users.first()}, do you accept the challenge from ${author}?`);
    await reply.react(yes);
    await reply.react(no);

    const filter = (reaction, user) => (reaction.emoji.name === yes || reaction.emoji.name === no) && user.id === mentions.users.firstKey();
    const reactions = await reply.awaitReactions(filter, {time: 15000, max: 1});

    if (reactions.firstKey() === no) {
        return message.reply(`your challenge was rejected by ${mentions.users.first()}`);
    }

    if (reactions.firstKey() === undefined) {
        return message.reply(`your challenge was not noticed by ${mentions.users.first()}`);
    }

    const chess = await create(author.id, mentions.users.firstKey());
    const color = getTurnColor(chess);
    const file = await chess.image();

    return message.channel.send(`It's your turn <@${chess.players[color]}>`, {file});
};

module.exports = initializeMatch;
