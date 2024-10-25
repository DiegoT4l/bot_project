import process from "node:process";
import type {
  CommandHandlerData,
  CommandHandlerOptions,
  DiscordBotInteraction,
} from "types/command-handler.ts";
import type { CommandFileObject } from "types/typing.ts";

import { toFileURL } from "utils/resolve-file-url.ts";
import { getFilePaths } from "utils/get-paths.ts";
import { clone } from "utils/clone.ts";

import registerCommands from "./functions/registerCommands.ts";
import builtInValidationsFunctions from "./validations/mod.ts";
import colors from "utils/colors.ts";
import { AsyncLocalStorage } from "npm:async_hooks";
import type { CommandData } from "types/index.ts";

export interface hCommandContext {
  interaction: DiscordBotInteraction;
  command: CommandData;
}

/**
 * A handler for client application commands.
 */
export class CommandHandler {
  #data: CommandHandlerData;
  context: AsyncLocalStorage<hCommandContext> | null = null;

  constructor({ ...options }: CommandHandlerOptions) {
    this.#data = {
      ...options,
      builtInValidations: [],
      commands: [],
    };
  }

  async init() {
    await this.#buildCommands();

    this.#buildBuiltInValidations();

    await registerCommands({
      client: this.#data.client,
      commands: this.#data.commands,
    });

    this.handleCommands();
  }

  async #buildCommands() {
    const allowedExtensions = /\.(js|mjs|cjs|ts)$/i;
    const paths = await getFilePaths(this.#data.commandsPath, true);

    const commandFilePaths = paths.filter((path) =>
      allowedExtensions.test(path)
    );

    for (const commandFilePath of commandFilePaths) {
      const modulePath = toFileURL(commandFilePath);

      const importedObj = await import(`${modulePath}?t=${Date.now()}`);
      let commandObj: CommandFileObject = clone(importedObj); // Make commandObj extensible

      const compactFilePath = commandFilePath.split(process.cwd())[1] ||
        commandFilePath;

      if (commandObj.default) {
        commandObj = commandObj.default as CommandFileObject;
      }

      // Ensure builder properties
      if (importedObj.default) {
        commandObj.data = importedObj.default.data;
      } else {
        commandObj.data = importedObj.data;
      }

      if (!commandObj.data) {
        process.emitWarning(
          colors.yellow(
            `Ignoring: Command file ${compactFilePath} does not export "data".`,
          ),
        );
        continue;
      }

      if (!commandObj.data.name) {
        process.emitWarning(
          colors.yellow(
            `Ignoring: Command file ${compactFilePath} does not export "data.name".`,
          ),
        );
        continue;
      }

      if (!commandObj.run) {
        process.emitWarning(
          colors.yellow(
            `Ignoring: Command file ${commandObj.data.name} does not export "run".`,
          ),
        );
        continue;
      }

      if (typeof commandObj.run !== "function") {
        process.emitWarning(
          colors.yellow(
            `Ignoring: Command file ${commandObj.data.name} does not export "run" as a function.`,
          ),
        );
        continue;
      }

      commandObj.filePath = commandFilePath;

      const commandCategory = commandFilePath
        .split(this.#data.commandsPath)[1]
        ?.replace(/\\\\|\\/g, "/")
        .split("/")[1] || null;

      if (commandCategory && allowedExtensions.test(commandCategory)) {
        commandObj.category = null;
      } else {
        commandObj.category = commandCategory;
      }

      this.#data.commands.push(commandObj);
    }
  }

  #buildBuiltInValidations() {
    for (const builtInValidationFunction of builtInValidationsFunctions) {
      this.#data.builtInValidations.push(builtInValidationFunction);
    }
  }

  handleCommands() {
    this.#data.client.on("interactionCreate", (interaction) => {
      if (
        !interaction.isChatInputCommand() &&
        !interaction.isContextMenuCommand() &&
        !interaction.isAutocomplete()
      ) {
        return;
      }

      const isAutocomplete = interaction.isAutocomplete();

      const targetCommand = this.#data.commands.find(
        (cmd) => cmd.data.name === interaction.commandName,
      );

      if (!targetCommand) return;

      const { data, options, _run, autocomplete, ...rest } = targetCommand;

      // Skip if autocomplete handler is not defined
      if (isAutocomplete && !autocomplete) return;

      const executor = async () => {
        const commandObj = {
          data: data,
          options: options,
          ...rest,
        };

        if (this.#data.validationHandler) {
          let canRun = true;

          for (
            const validationFunction of this.#data.validationHandler
              .validations
          ) {
            const stopValidationLoop = await validationFunction({
              interaction,
              commandObj,
              client: this.#data.client,
            });

            if (stopValidationLoop) {
              canRun = false;
              break;
            }
          }

          if (!canRun) return;
        }

        const command = targetCommand[isAutocomplete ? "autocomplete" : "run"]!;

        const context = {
          interaction,
          client: this.#data.client,
        };

        return command(context);
      };

      if (this.context) {
        return this.context.run(
          {
            command: targetCommand.data,
            interaction,
          },
          executor,
        );
      }
      return executor();
    });
  }

  get commands() {
    return this.#data.commands;
  }

  async reloadCommands() {
    if (!this.#data.commandsPath) {
      throw new Error(
        colors.red(
          'Cannot reload commands as "commandsPath" was not provided when instantiating DiscordBot.',
        ),
      );
    }

    this.#data.commands = [];

    // Re-build commands tree
    await this.#buildCommands();
    await registerCommands({
      client: this.#data.client,
      commands: this.#data.commands,
      reloading: true,
    });
  }
}
