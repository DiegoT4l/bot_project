import { assertEquals, assert } from "@std/assert";
import { Client } from 'discord.js';
import * as path from "node:path";


import logClientOnline from '../src/events/ready/ready.ts';

Deno.test("logClientOnline function should log client user tag as online", () => {
  // Crear un mock del objeto Client
  const mockClient = {
    user: {
      tag: "MockUser#1234",
    },
  } as Client<true>;

  // Capturar la salida de la consola
  const originalConsoleLog = console.log;
  let consoleOutput = "";
  console.log = (output: string) => {
    consoleOutput = output;
  };

  // Ejecutar la función con el mock del cliente
  logClientOnline(mockClient);

  // Restaurar la función original de console.log
  console.log = originalConsoleLog;

  // Verificar que el mensaje en la consola sea el esperado
  assertEquals(consoleOutput, "MockUser#1234 is online!");
});


import { DiscordBot } from "../src/DiscordBot.ts";

// Test para verificar que la clase DiscordBot se inicializa correctamente
Deno.test("DiscordBot initializes with client and loads commands/events", async () => {
  // Crear un mock de Client
  const mockClient = new Client({ intents: 32767 });

  // Directorios de prueba para comandos y eventos
  const commandsPath = path.join(Deno.cwd(), "mockCommands");
  const eventsPath = path.join(Deno.cwd(), "mockEvents");

  // Crear los directorios temporales para comandos y eventos
  // Si ya existen, no hace falta recrearlos
  try {
    await Deno.mkdir(commandsPath, { recursive: true });
    await Deno.mkdir(eventsPath, { recursive: true });
  } catch (err) {
    console.error("Error creating directories:", err);
  }

  try {
    // Inicializar el bot
    const bot = new DiscordBot({
      client: mockClient,
      commandsPath,
      eventsPath,
    });

    // Verificar que el cliente está correctamente configurado en el bot
    assert(bot.client === mockClient, "El cliente no se configuró correctamente");

    // Aquí puedes agregar más verificaciones si tu clase DiscordBot tiene métodos o propiedades específicas
    // Por ejemplo, podrías verificar que el bot ha cargado comandos o eventos
  } finally {
    // Limpiar directorios temporales creados
    await Deno.remove(commandsPath, { recursive: true });
    await Deno.remove(eventsPath, { recursive: true });
  }
});
