const logger = require('../common/logger');
const {create} = require('../store/games.js');

const initializeMatch = async (message, author, mentions) => {
    const yes = '📗';
    const no = '📕';

    if (author.id === mentions.users.firstKey()) {
        return message.reply(`You can't challenge yourself!`);
    }

    if (!mentions.users.firstKey()) {
        return message.reply('User not found!');
    }

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
    const file = await chess.image();

    return message.channel.send('Game?', {file});
};

const message = (message) => {
    const {author, channel, content, mentions} = message;
    logger.debug(`${channel.name}| ${author.username}: ${content}`);
    if (author.bot) {
        return;
    }

    let input;
    switch(true) {
        case /^c |^challenge /i.test(content):
            input = content.replace(/^c |^challenge /i);
            return initializeMatch(message, author, mentions)
                .catch(logger.error);
        case /^m |^move /i.test(content):
            return;
        default:
            return;
    }
};

module.exports = message;
