import type {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  Client,
  ContextMenuCommandInteraction,
} from "discord.js";
import type { CommandFileObject } from "types/typing.ts";
import type { ValidationHandler } from "handlers/validation-handler/ValidationHandler.ts";

/**
 * Command handler options.
 * Similar to DiscordBot options in structure.
 */
export interface CommandHandlerOptions {
  /**
   * The client created by the user.
   */
  client: Client;

  /**
   * Path to the user's commands.
   */
  commandsPath: string;
}

/**
 * Private command handler data.
 */
export interface CommandHandlerData extends CommandHandlerOptions {
  /**
   * An array of command file objects.
   */
  commands: CommandFileObject[];

  /**
   * An array of built-in validations.
   */
  builtInValidations: BuiltInValidation[];

  /**
   * A validation handler instance to run validations before commands.
   */
  validationHandler?: ValidationHandler;
}

/**
 * Parameters for DiscordBot's built-in validations.
 */
export interface BuiltInValidationParams {
  /**
   * The target command to validate.
   */
  targetCommand: CommandFileObject;

  /**
   * The interaction of the target command.
   */
  interaction: DiscordBotInteraction;

  /**
   * The command handler's data.
   */
  handlerData: CommandHandlerData;
}

/**
 * Represents a command interaction.
 */
export type DiscordBotInteraction =
  | ChatInputCommandInteraction
  | ContextMenuCommandInteraction
  | AutocompleteInteraction;

/**
 * A built in validation. Returns a boolean or void.
 */
export type BuiltInValidation = ({}: BuiltInValidationParams) => boolean | void;
