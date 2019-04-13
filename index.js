const image = require('./lib/image');
const {Chess} = require('chess.js');
const chess = new Chess();
chess.image = image;

require('./lib/discord/client');
