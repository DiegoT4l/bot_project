import process from "node:process";
import type {
  ApplicationCommandData,
  ApplicationCommandDataResolvable,
  Client,
} from "discord.js";
import type { CommandFileObject } from "types/typing.ts";

import areSlashCommandsDifferent from "../utils/areSlashCommandsDifferent.ts";

import colors from "utils/colors.ts";

type RegisterCommandProps = {
  client: Client;
  commands: CommandFileObject[];
  reloading?: boolean;
};

/**
 * Register client commands to Discord.
 * @param props
 */
export default async function registerCommands(props: RegisterCommandProps) {
  if (props.reloading) {
    if (props.client.isReady()) {
      await handleRegistration(
        props.client,
        props.commands,
      );
    } else {
      throw new Error(
        colors.red(`Cannot reload commands when client is not ready.`),
      );
    }
  } else {
    props.client.once("ready", async (c) => {
      await handleRegistration(
        c,
        props.commands,
      );
    });
  }
}

async function handleRegistration(
  client: Client<true>,
  commands: CommandFileObject[],
) {
  const globalCommands = commands.filter((cmd) => !cmd.options?.devOnly);

  await registerGlobalCommands(client, globalCommands);
}

async function registerGlobalCommands(
  client: Client<true>,
  commands: CommandFileObject[],
) {
  const appCommandsManager = client.application.commands;
  await appCommandsManager.fetch();

  for (const command of commands) {
    const targetCommand = appCommandsManager.cache.find(
      (cmd) => cmd.name === command.data.name,
    );

    // <!-- Delete global command -->
    if (command.options?.deleted) {
      if (!targetCommand) {
        process.emitWarning(
          colors.yellow(
            `Ignoring: Command "${command.data.name}" is globally marked as deleted.`,
          ),
        );
      } else {
        await targetCommand.delete().catch((error) => {
          throw new Error(
            colors.red(
              `Failed to delete command "${command.data.name}" globally.\n`,
            ),
            error,
          );
        });

        console.log(
          colors.green(`Deleted command "${command.data.name}" globally.`),
        );
      }

      continue;
    }

    // <!-- Edit global command -->
    if (targetCommand) {
      const commandsAreDifferent = areSlashCommandsDifferent(
        targetCommand,
        command.data,
      );

      if (commandsAreDifferent) {
        await targetCommand
          .edit(command.data as Partial<ApplicationCommandData>)
          .catch((error) => {
            throw new Error(
              colors.red(
                `Failed to edit command "${command.data.name}" globally.\n`,
              ),
              error,
            );
          });

        console.log(
          colors.green(`Edited command "${command.data.name}" globally.`),
        );

        continue;
      }
    }

    // <!-- Register global command -->
    if (targetCommand) continue;

    await appCommandsManager
      .create(command.data as ApplicationCommandDataResolvable)
      .catch((error) => {
        throw new Error(
          colors.red(
            `Failed to register command "${command.data.name}" globally.\n`,
          ),
          error,
        );
      });

    console.log(
      colors.green(`Registered command "${command.data.name}" globally.`),
    );
  }
}
