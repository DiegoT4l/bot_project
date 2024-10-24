import "jsr:@std/dotenv/load";
import path from 'node:path';
import { Client } from 'discord.js';
import { DiscordBot } from "./DiscordBot.ts";


// create a new Client instance
const client = new Client({ intents: 32767 });  // GatewayIntentBits.All

new DiscordBot({
    client,
    commandsPath: path.join(import.meta.dirname || '', 'commands'),
    eventsPath: path.join(import.meta.dirname || '', 'events'),
})

// login the client
client.login(Deno.env.get("TOKEN_BOT"));

