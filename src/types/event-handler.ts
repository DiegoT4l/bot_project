// deno-lint-ignore-file ban-types
import type { Client } from 'discord.js';

/**
 * Event handler options.
 */
export interface EventHandlerOptions {
  client: Client;
  eventsPath: string;
}

/**
 * Private event handler data.
 */
export interface EventHandlerData extends EventHandlerOptions {
  events: { name: string; functions: Function[] }[];
}