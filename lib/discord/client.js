const config = require('config');
const Discord = require('discord.js');
const logger = require('../common/logger');
const client = new Discord.Client({disableEveryone: true});
const message = require('./message');
logger.info(`Running in ${process.env.NODE_ENV} mode`);

client.on('ready', () => logger.info('Shiro is online and ready to play chess!'));

client.on('message', message);

client.on('error', logger.error);

client.login(config.get('discord.token'))
    .catch(error => logger.error('Failed to login!', error));

process.on('uncaughtException', error => logger.error('Caught exception:', error));
