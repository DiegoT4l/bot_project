import { CommandKit } from 'npm:commandkit';
import { Client, GatewayIntentBits } from 'npm:discord.js';
import path from 'node:path';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
});

new CommandKit({
  client,
  commandsPath: path.join(__dirname, 'commands'),
  eventsPath: path.join(__dirname, 'events'),
  validationsPath: path.join(__dirname, 'validations'),
  devGuildIds: ['DEV_SERVER_ID_1', 'DEV_SERVER_ID_2'],
  devUserIds: ['DEV_USER_ID_1', 'DEV_USER_ID_2'],
  devRoleIds: ['DEV_ROLE_ID_1', 'DEV_ROLE_ID_2'],
  skipBuiltInValidations: true,
  bulkRegister: true,
});

client.login('YOUR_TOKEN_HERE');