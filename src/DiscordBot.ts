import { CommandHandler, EventHandler } from "handlers/mod.ts";
import colors from "utils/colors.ts";

import type { DiscordBotData, DiscordBotOptions } from "types/typing.ts";
import type { CommandObject } from "types/index.ts";

export class DiscordBot {
  #data: DiscordBotData;
  static _instance: DiscordBot | null = null;

  /**
   * Create a new command and event handler with DiscordBot.
   *
   * @param options - The default DiscordBot configuration.
   * @see {@link https://github.com/GemeWolf/bot_project}
   */
  constructor(options: DiscordBotOptions) {
    if (!options.client) {
      throw new Error(
        colors.red('"client" is required when instantiating DiscordBot.'),
      );
    }

    if (options.validationsPath && !options.commandsPath) {
      throw new Error(
        colors.red('"commandsPath" is required when "validationsPath" is set.'),
      );
    }

    this.#data = options;
    DiscordBot._instance = this;

    this.#init();
  }

  /**
   * Get the client attached to this DiscordBot instance.
   */
  get client() {
    return this.#data.client;
  }

  /**
   * Get command handler instance.
   */
  get commandHandler() {
    return this.#data.commandHandler;
  }

  /**
   * (Private) Initialize DiscordBot.
   */
  async #init() {
    // <!-- Setup event handler -->
    if (this.#data.eventsPath) {
      const eventHandler = new EventHandler({
        client: this.#data.client,
        eventsPath: this.#data.eventsPath,
      });

      await eventHandler.init();

      this.#data.eventHandler = eventHandler;
    }

    // <!-- Setup command handler -->
    if (this.#data.commandsPath) {
      const commandHandler = new CommandHandler({
        client: this.#data.client,
        commandsPath: this.#data.commandsPath,
      });

      await commandHandler.init();

      this.#data.commandHandler = commandHandler;
    }
  }

  /**
   * Updates application commands with the latest from "commandsPath".
   */
  async reloadCommands() {
    if (!this.#data.commandHandler) return;
    await this.#data.commandHandler.reloadCommands();
  }

  /**
   * Updates application events with the latest from "eventsPath".
   */
  async reloadEvents() {
    if (!this.#data.eventHandler) return;
    await this.#data.eventHandler.reloadEvents(this.#data.commandHandler);
  }

  /**
   * @returns An array of objects of all the commands that DiscordBot is handling.
   */
  get commands(): CommandObject[] {
    if (!this.#data.commandHandler) {
      return [];
    }

    const commands = this.#data.commandHandler.commands.map(
      (cmd: CommandObject) => {
        const { _run, _autocomplete, ...command } = cmd;
        return command;
      },
    );

    return commands;
  }

  /**
   * @returns The path to the commands folder which was set when instantiating DiscordBot.
   */
  get commandsPath(): string | undefined {
    return this.#data.commandsPath;
  }

  /**
   * @returns The path to the events folder which was set when instantiating DiscordBot.
   */
  get eventsPath(): string | undefined {
    return this.#data.eventsPath;
  }
}
