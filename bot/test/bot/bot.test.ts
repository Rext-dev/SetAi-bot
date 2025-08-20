import { Bot } from "../../src/bot/bot";
import { BotClient } from "../../src/bot/bot-client";
import { CommandRegistry } from "../../src/services/command-registry-service";
import { ModelService } from "../../src/services/models-service";
import { PromptCommand } from "../../src/commands/implementations/prompt-command";
import { BotConfig } from "../../src/types/bot.types";

// Mock all dependencies
jest.mock("../../src/bot/bot-client");
jest.mock("../../src/services/command-registry-service");
jest.mock("../../src/services/models-service");
jest.mock("../../src/commands/implementations/prompt-command");

describe("Bot", () => {
  let bot: Bot;
  let mockBotClient: jest.Mocked<BotClient>;
  let mockCommandRegistry: jest.Mocked<CommandRegistry>;
  let mockModelService: jest.Mocked<ModelService>;
  let mockPromptCommand: jest.Mocked<PromptCommand>;
  let config: BotConfig;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock BotClient
    mockBotClient = {
      addCommand: jest.fn(),
      login: jest.fn().mockResolvedValue("logged-in-token"),
      destroy: jest.fn(),
    } as any;
    (BotClient as jest.MockedClass<typeof BotClient>).mockImplementation(
      () => mockBotClient
    );

    // Mock CommandRegistry
    mockCommandRegistry = {
      registerCommand: jest.fn(),
      deployCommands: jest.fn().mockResolvedValue(undefined),
      getCommands: jest.fn().mockReturnValue([]),
    } as any;
    (
      CommandRegistry as jest.MockedClass<typeof CommandRegistry>
    ).mockImplementation(() => mockCommandRegistry);

    // Mock ModelService
    mockModelService = {
      getAvailableModels: jest.fn().mockReturnValue([]),
      getDefaultModel: jest.fn().mockReturnValue("default-model"),
      isValidModel: jest.fn().mockReturnValue(true),
    } as any;
    (ModelService as jest.MockedClass<typeof ModelService>).mockImplementation(
      () => mockModelService
    );

    // Mock PromptCommand
    mockPromptCommand = {
      data: { name: "prompt" },
      execute: jest.fn(),
    } as any;
    (
      PromptCommand as jest.MockedClass<typeof PromptCommand>
    ).mockImplementation(() => mockPromptCommand);

    // Test configuration
    config = {
      token: "test-token",
      clientId: "test-client-id",
      guildId: "test-guild-id",
    };

    bot = new Bot(config);
  });

  describe("constructor", () => {
    it("should initialize all services and client", () => {
      expect(BotClient).toHaveBeenCalledTimes(1);
      expect(CommandRegistry).toHaveBeenCalledWith(config);
      expect(ModelService).toHaveBeenCalledTimes(1);
    });

    it("should initialize commands", () => {
      expect(PromptCommand).toHaveBeenCalledWith(mockModelService);
      expect(mockCommandRegistry.registerCommand).toHaveBeenCalledWith(
        mockPromptCommand
      );
      expect(mockBotClient.addCommand).toHaveBeenCalledWith(mockPromptCommand);
    });

    it("should call initializeCommands during construction", () => {
      // Verify that commands are initialized by checking the calls
      expect(mockCommandRegistry.registerCommand).toHaveBeenCalledTimes(1);
      expect(mockBotClient.addCommand).toHaveBeenCalledTimes(1);
    });
  });

  describe("initializeCommands", () => {
    it("should create and register PromptCommand", () => {
      // Commands should already be initialized in constructor
      expect(PromptCommand).toHaveBeenCalledWith(mockModelService);
      expect(mockCommandRegistry.registerCommand).toHaveBeenCalledWith(
        mockPromptCommand
      );
      expect(mockBotClient.addCommand).toHaveBeenCalledWith(mockPromptCommand);
    });
  });

  describe("start", () => {
    it("should deploy commands and login successfully", async () => {
      await bot.start();

      expect(mockCommandRegistry.deployCommands).toHaveBeenCalledTimes(1);
      expect(mockBotClient.login).toHaveBeenCalledWith(config.token);
    });

    it("should deploy commands before logging in", async () => {
      const deployOrder: string[] = [];

      mockCommandRegistry.deployCommands.mockImplementation(() => {
        deployOrder.push("deploy");
        return Promise.resolve();
      });

      mockBotClient.login.mockImplementation(() => {
        deployOrder.push("login");
        return Promise.resolve("logged-in-token");
      });

      await bot.start();

      expect(deployOrder).toEqual(["deploy", "login"]);
    });

    it("should handle deployment errors gracefully", async () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const processExitSpy = jest
        .spyOn(process, "exit")
        .mockImplementation(() => {
          throw new Error("Process exit called");
        });

      const deployError = new Error("Deployment failed");
      mockCommandRegistry.deployCommands.mockRejectedValue(deployError);

      await expect(bot.start()).rejects.toThrow("Process exit called");

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error starting bot:",
        deployError
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
      expect(mockBotClient.login).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
      processExitSpy.mockRestore();
    });

    it("should handle login errors gracefully", async () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const processExitSpy = jest
        .spyOn(process, "exit")
        .mockImplementation(() => {
          throw new Error("Process exit called");
        });

      const loginError = new Error("Login failed");
      mockBotClient.login.mockRejectedValue(loginError);

      await expect(bot.start()).rejects.toThrow("Process exit called");

      expect(mockCommandRegistry.deployCommands).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error starting bot:",
        loginError
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);

      consoleSpy.mockRestore();
      processExitSpy.mockRestore();
    });

    it("should handle both deployment and login errors", async () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const processExitSpy = jest
        .spyOn(process, "exit")
        .mockImplementation(() => {
          throw new Error("Process exit called");
        });

      const deployError = new Error("Deployment failed");
      mockCommandRegistry.deployCommands.mockRejectedValue(deployError);

      await expect(bot.start()).rejects.toThrow("Process exit called");

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error starting bot:",
        deployError
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
      expect(mockBotClient.login).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
      processExitSpy.mockRestore();
    });

    it("should not call process.exit when no errors occur", async () => {
      const processExitSpy = jest
        .spyOn(process, "exit")
        .mockImplementation(() => {
          throw new Error("Process exit should not be called");
        });

      await bot.start();

      expect(mockCommandRegistry.deployCommands).toHaveBeenCalledTimes(1);
      expect(mockBotClient.login).toHaveBeenCalledWith(config.token);
      expect(processExitSpy).not.toHaveBeenCalled();

      processExitSpy.mockRestore();
    });
  });

  describe("stop", () => {
    it("should call client destroy", async () => {
      await bot.stop();

      expect(mockBotClient.destroy).toHaveBeenCalledTimes(1);
    });

    it("should be callable multiple times", async () => {
      await bot.stop();
      await bot.stop();

      expect(mockBotClient.destroy).toHaveBeenCalledTimes(2);
    });
  });

  describe("integration", () => {
    it("should be able to start and stop bot", async () => {
      await bot.start();
      await bot.stop();

      expect(mockCommandRegistry.deployCommands).toHaveBeenCalledTimes(1);
      expect(mockBotClient.login).toHaveBeenCalledTimes(1);
      expect(mockBotClient.destroy).toHaveBeenCalledTimes(1);
    });

    it("should maintain service references throughout lifecycle", async () => {
      // Verify services are accessible and functional
      expect(bot).toBeInstanceOf(Bot);

      await bot.start();

      // Services should still be functional
      expect(mockCommandRegistry.deployCommands).toHaveBeenCalledTimes(1);
      expect(mockBotClient.login).toHaveBeenCalledTimes(1);

      await bot.stop();

      // Stop should work regardless of start state
      expect(mockBotClient.destroy).toHaveBeenCalledTimes(1);
    });

    it("should handle config variations", () => {
      const configWithoutGuild = {
        token: "test-token",
        clientId: "test-client-id",
      };

      const botWithoutGuild = new Bot(configWithoutGuild);

      expect(CommandRegistry).toHaveBeenLastCalledWith(configWithoutGuild);
      expect(botWithoutGuild).toBeInstanceOf(Bot);
    });
  });
});
