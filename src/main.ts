import "jsr:@std/dotenv/load";
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
  skipBuiltInValidations: true,
  bulkRegister: true,
});

client.login(Deno.env.get("TOKEN_BOT"));