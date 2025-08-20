import { REST, Routes } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandRegistry } from "../../src/services/command-registry-service";
import { BotConfig, ICommand } from "../../src/types/bot.types";
import { mock, MockProxy } from "jest-mock-extended";

jest.mock("discord.js", () => ({
  ...jest.requireActual("discord.js"),
  REST: jest.fn(),
  Routes: {
    applicationCommands: jest.fn(),
    applicationGuildCommands: jest.fn(),
  },
}));

describe("CommandRegistry", () => {
  let commandRegistry: CommandRegistry;
  let mockRest: MockProxy<REST>;
  let mockCommand: MockProxy<ICommand>;
  let mockSlashCommandBuilder: MockProxy<SlashCommandBuilder>;
  let config: BotConfig;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock REST instance
    mockRest = mock<REST>();
    mockRest.setToken.mockReturnThis();
    mockRest.put.mockResolvedValue([{ name: "test" }]);
    (REST as jest.MockedClass<typeof REST>).mockImplementation(() => mockRest);

    // Mock SlashCommandBuilder
    mockSlashCommandBuilder = mock<SlashCommandBuilder>();
    mockSlashCommandBuilder.toJSON.mockReturnValue({
      name: "test",
      description: "Test command",
    });

    // Mock command
    mockCommand = mock<ICommand>();
    mockCommand.data = mockSlashCommandBuilder;

    // Test configuration
    config = {
      token: "test-token",
      clientId: "test-client-id",
      guildId: "test-guild-id",
    };

    commandRegistry = new CommandRegistry(config);
  });

  describe("constructor", () => {
    it("should initialize with empty commands array", () => {
      expect(commandRegistry.getCommands()).toEqual([]);
    });

    it("should create REST instance with token", () => {
      expect(REST).toHaveBeenCalled();
      expect(mockRest.setToken).toHaveBeenCalledWith(config.token);
    });
  });

  describe("registerCommand", () => {
    it("should register a command successfully", () => {
      commandRegistry.registerCommand(mockCommand);

      const commands = commandRegistry.getCommands();
      expect(commands).toHaveLength(1);
      expect(commands[0]).toBe(mockCommand);
    });

    it("should register multiple commands", () => {
      const mockCommand2 = mock<ICommand>();
      const mockSlashCommandBuilder2 = mock<SlashCommandBuilder>();
      mockCommand2.data = mockSlashCommandBuilder2;

      commandRegistry.registerCommand(mockCommand);
      commandRegistry.registerCommand(mockCommand2);

      const commands = commandRegistry.getCommands();
      expect(commands).toHaveLength(2);
      expect(commands[0]).toBe(mockCommand);
      expect(commands[1]).toBe(mockCommand2);
    });
  });

  describe("getCommands", () => {
    it("should return a copy of commands array", () => {
      commandRegistry.registerCommand(mockCommand);

      const commands1 = commandRegistry.getCommands();
      const commands2 = commandRegistry.getCommands();

      expect(commands1).toEqual(commands2);
      expect(commands1).not.toBe(commands2);
    });

    it("should return empty array when no commands registered", () => {
      expect(commandRegistry.getCommands()).toEqual([]);
    });
  });

  describe("deployCommands", () => {
    beforeEach(() => {
      // Setup console spies
      jest.spyOn(console, "log").mockImplementation(() => {});
      jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("should deploy commands to guild when guildId is provided", async () => {
      commandRegistry.registerCommand(mockCommand);

      (Routes.applicationGuildCommands as jest.Mock).mockReturnValue(
        "guild-route"
      );

      await commandRegistry.deployCommands();

      expect(Routes.applicationGuildCommands).toHaveBeenCalledWith(
        config.clientId,
        config.guildId
      );
      expect(mockRest.put).toHaveBeenCalledWith("guild-route", {
        body: [{ name: "test", description: "Test command" }],
      });
      expect(console.log).toHaveBeenCalledWith(
        "Started refreshing 1 application (/) commands"
      );
      expect(console.log).toHaveBeenCalledWith(
        "Successfully reloaded 1 application (/) commands."
      );
    });

    it("should deploy commands globally when guildId is not provided", async () => {
      const configWithoutGuild = {
        token: "test-token",
        clientId: "test-client-id",
      };

      const registryWithoutGuild = new CommandRegistry(configWithoutGuild);
      registryWithoutGuild.registerCommand(mockCommand);

      (Routes.applicationCommands as jest.Mock).mockReturnValue("global-route");

      await registryWithoutGuild.deployCommands();

      expect(Routes.applicationCommands).toHaveBeenCalledWith(
        configWithoutGuild.clientId
      );
      expect(mockRest.put).toHaveBeenCalledWith("global-route", {
        body: [{ name: "test", description: "Test command" }],
      });
    });

    it("should handle deployment with no commands", async () => {
      await commandRegistry.deployCommands();

      expect(console.log).toHaveBeenCalledWith(
        "Started refreshing 0 application (/) commands"
      );
      expect(mockRest.put).toHaveBeenCalledWith(expect.any(String), {
        body: [],
      });
      expect(console.log).toHaveBeenCalledWith(
        "Successfully reloaded 1 application (/) commands."
      );
    });

    it("should handle deployment errors gracefully", async () => {
      const error = new Error("Deployment failed");
      mockRest.put.mockRejectedValue(error);

      commandRegistry.registerCommand(mockCommand);

      await commandRegistry.deployCommands();

      expect(console.error).toHaveBeenCalledWith(
        "Error deploying commands",
        error
      );
    });

    it("should log correct number of commands", async () => {
      const mockCommand2 = mock<ICommand>();
      const mockSlashCommandBuilder2 = mock<SlashCommandBuilder>();
      mockSlashCommandBuilder2.toJSON.mockReturnValue({
        name: "test2",
        description: "Test command 2",
      });
      mockCommand2.data = mockSlashCommandBuilder2;

      commandRegistry.registerCommand(mockCommand);
      commandRegistry.registerCommand(mockCommand2);

      await commandRegistry.deployCommands();

      expect(console.log).toHaveBeenCalledWith(
        "Started refreshing 2 application (/) commands"
      );
      expect(mockRest.put).toHaveBeenCalledWith(expect.any(String), {
        body: [
          { name: "test", description: "Test command" },
          { name: "test2", description: "Test command 2" },
        ],
      });
    });

    it("should handle REST.put returning different data length", async () => {
      mockRest.put.mockResolvedValue([
        { name: "test1" },
        { name: "test2" },
        { name: "test3" },
      ]);

      commandRegistry.registerCommand(mockCommand);

      await commandRegistry.deployCommands();

      expect(console.log).toHaveBeenCalledWith(
        "Successfully reloaded 3 application (/) commands."
      );
    });
  });
});
