import type { CommandData, SlashCommandProps, CommandOptions } from 'types/index.ts';

export const data: CommandData = {
  name: 'ping',
  description: 'Pong!',
}

export function run({ interaction, client }: SlashCommandProps) {
  interaction.reply(`:ping_pong: Pong! ${client.ws.ping}ms`);
}

export const options: CommandOptions = {
  devOnly: true,
  userPermissions: ['Administrator', 'AddReactions'],
  botPermissions: ['Administrator', 'AddReactions'],
  deleted: false,
}