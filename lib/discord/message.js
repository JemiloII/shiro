const logger = require('../common/logger');
const {active, create, update} = require('../store/games');
const {isPlaying} = require('../store/players');

const getTurnColor = chess => chess.turn() === 'w' ? 'white' : 'black';

const checkNewMatch = async (message) => {
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

const initializeMatch = async (message, author, mentions) => {
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

const checkGameOver = (chess, player) => {
    let message = false;
    if (chess.in_draw()) {
        chess.draw = 'draw';
        message = `<@${chess.players.white}> has drew against <@${chess.players.black}>`;
    }

    if (chess.in_stalemate()) {
        chess.winner = 'stalemate';
        message = `<@${chess.players.white}> has stalemated against <@${chess.players.black}>`;
    }

    if (chess.game_over()) {
        chess.winner = player;
        message = `Hooray! <@${player}> has won!`;
    }

    if (message) {
        update(chess);
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
    const isGameOver = checkGameOver(chess, author);
    if (isGameOver) {
        return message.channel.send(isGameOver);
    }

    const color = getTurnColor();
    const file = await chess.image();

    return message.channel.send(`It\'s your turn <@${chess.players[color]}>`, {file});
};

const message = (message) => {
    const {author, content, mentions} = message;
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
