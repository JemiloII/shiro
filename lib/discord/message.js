const logger = require('../common/logger');
const {active, create} = require('../store/games.js');

const getTurnColor = chess => chess.turn() === 'w' ? 'white' : 'black';

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
    const color = getTurnColor(chess);
    const file = await chess.image();

    return message.channel.send(`It's your turn <@${chess.players[color]}>`, {file});
};

const isGameOver = chess => {
    let message = false;
    if (chess.in_draw()) {
        message = `<@${chess.players.white}> has drew against <@${chess.players.black}>`;
    }

    if (chess.in_stalemate()) {
        message = `<@${chess.players.white}> has stalemated against <@${chess.players.black}>`;
    }

    if (chess.game_over()) {
        message = `Hooray! <@${author}> has won!`;
    }

    if (message) {
        active.delete(chess.players.black);
        active.delete(chess.players.white);
        active.delete(chess.id);
    }

    return message;
};

const move = async (message, author, input) => {
    const chess = active.get(author.id);
    if (!chess.players[getTurnColor(chess)] === author.id) {
        return;
    }

    chess.move(input);

    const color = getTurnColor();
    const file = await chess.image();

    return message.channel.send(`It\'s your turn <@${chess.players[color]}>`, {file});
};

const message = (message) => {
    const {author, channel, content, mentions} = message;
    if (author.bot) {
        return;
    }

    let input;
    switch(true) {
        case /^c |^challenge /i.test(content):
            return initializeMatch(message, author, mentions)
                .catch(logger.error);
        case /^\|g |^m |^move /i.test(content):
            input = content.replace(/^\|g |^m |^move /i, '');
            return move(message, author, input)
                .catch(logger.error);
        default:
            return;
    }
};

module.exports = message;
