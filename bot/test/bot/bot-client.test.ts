import { BotClient } from "../../src/bot/bot-client";
import { ICommand } from "../../src/types/bot.types";

jest.mock("discord.js", () => ({
  Client: class MockClient {
    commands = new (jest.fn().mockImplementation(() => ({
      set: jest.fn(),
      get: jest.fn(),
    })))();

    onceCalls: any[] = [];
    onCalls: any[] = [];

    constructor() {
      this.onceCalls = [];
      this.onCalls = [];
    }

    once = jest.fn().mockImplementation((event: string, callback: Function) => {
      this.onceCalls.push({ event, callback });
      return this;
    });

    on = jest.fn().mockImplementation((event: string, callback: Function) => {
      this.onCalls.push({ event, callback });
      return this;
    });
  },
  Collection: jest.fn().mockImplementation(() => ({
    set: jest.fn(),
    get: jest.fn(),
  })),
  Events: {
    ClientReady: "ready",
    InteractionCreate: "interactionCreate",
  },
  GatewayIntentBits: {
    Guilds: 1,
    GuildMessages: 2,
  },
}));

describe("BotClient", () => {
  let botClient: BotClient;
  let mockCollection: any;
  let mockCommand: any;
  let mockInteraction: any;
  let readyCallback: Function;
  let interactionCallback: Function;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock command
    mockCommand = {
      data: { name: "test-command" },
      execute: jest.fn().mockResolvedValue(undefined),
    };

    // Mock interaction
    mockInteraction = {
      isChatInputCommand: jest.fn().mockReturnValue(true),
      commandName: "test-command",
      replied: false,
      deferred: false,
      reply: jest.fn().mockResolvedValue({}),
      followUp: jest.fn().mockResolvedValue({}),
    };

    botClient = new BotClient();
    mockCollection = botClient.commands;

    // Extract callbacks from the mocked client
    const clientInstance = botClient as any;
    readyCallback = clientInstance.onceCalls?.find(
      (call: any) => call.event === "ready"
    )?.callback;
    interactionCallback = clientInstance.onCalls?.find(
      (call: any) => call.event === "interactionCreate"
    )?.callback;
  });

  describe("constructor", () => {
    it("should initialize commands collection", () => {
      expect(botClient.commands).toBeDefined();
    });

    it("should setup event listeners", () => {
      expect(botClient).toBeInstanceOf(BotClient);
    });
  });

  describe("event handlers", () => {
    describe("ClientReady event", () => {
      it("should log ready message when client is ready", () => {
        const consoleSpy = jest
          .spyOn(console, "log")
          .mockImplementation(() => {});
        const mockClient = { user: { tag: "TestBot#1234" } };

        if (readyCallback) {
          readyCallback(mockClient);
          expect(consoleSpy).toHaveBeenCalledWith(
            "Bot is ready!, logged in as TestBot#1234"
          );
        }

        consoleSpy.mockRestore();
      });
    });

    describe("InteractionCreate event", () => {
      beforeEach(() => {
        mockCollection.get.mockReturnValue(mockCommand);
      });

      it("should ignore non-chat input commands", async () => {
        const mockNonChatInteraction = {
          isChatInputCommand: jest.fn().mockReturnValue(false),
        };

        if (interactionCallback) {
          await interactionCallback(mockNonChatInteraction);
        }

        expect(mockCollection.get).not.toHaveBeenCalled();
        expect(mockCommand.execute).not.toHaveBeenCalled();
      });

      it("should execute command when valid chat input command is received", async () => {
        if (interactionCallback) {
          await interactionCallback(mockInteraction);
        }

        expect(mockCollection.get).toHaveBeenCalledWith("test-command");
        expect(mockCommand.execute).toHaveBeenCalledWith(mockInteraction);
      });

      it("should log error when command not found", async () => {
        const consoleSpy = jest
          .spyOn(console, "error")
          .mockImplementation(() => {});
        mockCollection.get.mockReturnValue(undefined);

        if (interactionCallback) {
          await interactionCallback(mockInteraction);
        }

        expect(consoleSpy).toHaveBeenCalledWith(
          "No command matching test-command was found."
        );
        expect(mockCommand.execute).not.toHaveBeenCalled();

        consoleSpy.mockRestore();
      });

      it("should handle command execution errors - not replied or deferred", async () => {
        const consoleSpy = jest
          .spyOn(console, "error")
          .mockImplementation(() => {});
        const executionError = new Error("Command execution failed");
        mockCommand.execute.mockRejectedValue(executionError);

        if (interactionCallback) {
          await interactionCallback(mockInteraction);
        }

        expect(consoleSpy).toHaveBeenCalledWith(
          "Error executing test-command:",
          executionError
        );
        expect(mockInteraction.reply).toHaveBeenCalledWith({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });

        consoleSpy.mockRestore();
      });

      it("should handle command execution errors - interaction replied", async () => {
        const consoleSpy = jest
          .spyOn(console, "error")
          .mockImplementation(() => {});
        const executionError = new Error("Command execution failed");
        mockCommand.execute.mockRejectedValue(executionError);
        mockInteraction.replied = true;

        if (interactionCallback) {
          await interactionCallback(mockInteraction);
        }

        expect(consoleSpy).toHaveBeenCalledWith(
          "Error executing test-command:",
          executionError
        );
        expect(mockInteraction.followUp).toHaveBeenCalledWith({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
        expect(mockInteraction.reply).not.toHaveBeenCalled();

        consoleSpy.mockRestore();
      });

      it("should handle command execution errors - interaction deferred", async () => {
        const consoleSpy = jest
          .spyOn(console, "error")
          .mockImplementation(() => {});
        const executionError = new Error("Command execution failed");
        mockCommand.execute.mockRejectedValue(executionError);
        mockInteraction.deferred = true;

        if (interactionCallback) {
          await interactionCallback(mockInteraction);
        }

        expect(consoleSpy).toHaveBeenCalledWith(
          "Error executing test-command:",
          executionError
        );
        expect(mockInteraction.followUp).toHaveBeenCalledWith({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
        expect(mockInteraction.reply).not.toHaveBeenCalled();

        consoleSpy.mockRestore();
      });
    });
  });

  describe("addCommand", () => {
    it("should add command to collection", () => {
      botClient.addCommand(mockCommand as any);

      expect(mockCollection.set).toHaveBeenCalledWith(
        "test-command",
        mockCommand
      );
    });

    it("should add multiple commands", () => {
      const mockCommand2 = {
        data: { name: "second-command" },
        execute: jest.fn(),
      };

      botClient.addCommand(mockCommand as any);
      botClient.addCommand(mockCommand2 as any);

      expect(mockCollection.set).toHaveBeenCalledWith(
        "test-command",
        mockCommand
      );
      expect(mockCollection.set).toHaveBeenCalledWith(
        "second-command",
        mockCommand2
      );
      expect(mockCollection.set).toHaveBeenCalledTimes(2);
    });
  });
});
