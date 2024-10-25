// This types file is for development

import type { CacheType, Client, Interaction } from "discord.js";
import type { CommandData, CommandOptions, ReloadType } from "types/index.ts";
import type { CommandHandler, EventHandler } from "handlers/mod.ts";

/**
 * Options for instantiating a DiscordBot handler.
 */
export interface DiscordBotOptions {
  /**
   * The Discord.js client object to use with DiscordBot.
   */
  client: Client;

  /**
   * The path to your commands directory.
   */
  commandsPath?: string;

  /**
   * The path to your events directory.
   */
  eventsPath?: string;

  /**
   * The path to the validations directory.
   */
  validationsPath?: string;
}

/**
 * Private data for the DiscordBot class.
 */
export interface DiscordBotData extends DiscordBotOptions {
  commandHandler?: CommandHandler;
  eventHandler?: EventHandler;
}

/**
 * Represents a command context.
 */
export interface CommandContext<
  T extends Interaction,
  Cached extends CacheType,
> {
  /**
   * The interaction that triggered this command.
   */
  interaction: Interaction<CacheType>;
  /**
   * The client that instantiated this command.
   */
  client: Client;
}

/**
 * Represents a command file.
 */
export interface CommandFileObject {
  data: CommandData;
  options?: CommandOptions;
  run: <Cached extends CacheType = CacheType>(
    ctx: CommandContext<Interaction, Cached>,
  ) => Awaited<void>;
  autocomplete?: <Cached extends CacheType = CacheType>(
    ctx: CommandContext<Interaction, Cached>,
  ) => Awaited<void>;
  filePath: string;
  category: string | null;
  // deno-lint-ignore no-explicit-any
  [key: string]: any;
}

/**
 * A reload type for commands.
 */
export type ReloadOptions = "dev" | "global" | ReloadType;
