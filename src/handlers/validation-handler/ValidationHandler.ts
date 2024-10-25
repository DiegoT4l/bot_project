import process from "node:process";
import type {
  ValidationHandlerData,
  ValidationHandlerOptions,
} from "types/validation-handler.ts";
import { toFileURL } from "utils/resolve-file-url.ts";
import { getFilePaths } from "utils/get-paths.ts";
import { clone } from "utils/clone.ts";
import colors from "utils/colors.ts";

/**
 * A handler for command validations.
 */
export class ValidationHandler {
  #data: ValidationHandlerData;

  constructor({ ...options }: ValidationHandlerOptions) {
    this.#data = {
      ...options,
      validations: [],
    };
  }

  async init() {
    this.#data.validations = await this.#buildValidations();
  }

  async #buildValidations() {
    const allowedExtensions = /\.(js|mjs|cjs|ts)$/i;

    const validationPaths = await getFilePaths(
      this.#data.validationsPath,
      true,
    );
    const validationFilePaths = validationPaths.filter((path) =>
      allowedExtensions.test(path)
    );

    // deno-lint-ignore ban-types
    const validationFunctions: Function[] = [];

    for (const validationFilePath of validationFilePaths) {
      const modulePath = toFileURL(validationFilePath);

      const importedFunction = (await import(`${modulePath}?t=${Date.now()}`))
        .default;
      let validationFunction = clone(importedFunction);

      if (validationFunction?.default) {
        validationFunction = validationFunction.default;
      }

      const compactFilePath = validationFilePath.split(process.cwd())[1] ||
        validationFilePath;

      if (typeof validationFunction !== "function") {
        process.emitWarning(
          colors.yellow(
            `Ignoring: Validation file ${compactFilePath} does not export a function.`,
          ),
        );
        continue;
      }

      validationFunctions.push(validationFunction);
    }

    return validationFunctions;
  }

  get validations() {
    return this.#data.validations;
  }

  async reloadValidations() {
    if (!this.#data.validationsPath) {
      throw new Error(
        colors.red(
          'Cannot reload validations as "validationsPath" was not provided when instantiating DiscordBot.',
        ),
      );
    }

    const newValidations = await this.#buildValidations();

    this.#data.validations = newValidations;
  }
}
