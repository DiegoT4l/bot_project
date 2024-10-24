// This types file is for development
// For exported types use ./types/index.ts

import type { CacheType, Client, Interaction } from 'discord.js';
import type {
    CommandData,
    CommandOptions,
    ReloadType
} from './index';
import type {
    CommandHandler,
    EventHandler,
} from './handlers';

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
    [key: string]: any;
}

/**
 * A reload type for commands.
 */
export type ReloadOptions = 'dev' | 'global' | ReloadType;