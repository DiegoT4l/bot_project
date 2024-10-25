import { assertEquals } from "@std/assert";
import { Client } from "discord.js";
import logClientOnline from "../src/events/ready/ready.ts";

Deno.test("logClientOnline function should log client user tag as online", () => {
  // Create a mock of the Client object
  const mockClient = {
    user: {
      tag: "Mockbot#1745",
    },
  } as Client<true>;

  // Capture console output
  const originalConsoleLog = console.log;
  let consoleOutput = "";
  console.log = (output: string) => {
    consoleOutput = output;
  };

  // Execute the function with the mock client
  logClientOnline(mockClient);

  // Restore the original console.log function
  console.log = originalConsoleLog;

  // Verify that the console message is as expected
  assertEquals(consoleOutput, "Mockbot#1745 is online!");
});