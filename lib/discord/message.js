const logger = require('../common/logger');
const {create} = require('../../store/games.js');

const accept = new Map([]);
const yes = 'regional_indicator_y';
const no = 'regional_indicator_n';
const initializeMatch = (message, author, mentions) => {
    if (!mentions.users.firstKey()) {
        return message.reply('User not found!');
    }

    accept.set({
        player1: author.id,
        player2: mentions.users.firstKey()
    });

    return message.channel.send(`${mentions.users.first()}, do you accept the challenge from ${author}?`)
        .then(reply => {
            reply.react(yes);
            reply.react(no);
            const filter = (reaction, user) => (reaction.emoji.name === yes || reaction.emoji.name === no) && user.id === mentions.user.first().id;
            return reply.awaitReactions(filter, { time: 15000 });
        })
        .then(reactions => {
            console.log(`Collected ${reactions.size} reactions`)
        })
        .catch(e => console.log(e));
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
            input = content.replace(/^c /i).replace(/^challenge/i);
            return initializeMatch(message, author, mentions);
        case /^m |^move /i.test(content):
            return;
        default:
            return;
    }
};

module.exports = message;
