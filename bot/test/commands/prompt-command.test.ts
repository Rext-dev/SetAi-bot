import { ChatInputCommandInteraction, CommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { PromptCommand } from "../../src/commands/implementations/prompt-command";
import { ModelService } from "../../src/services/models-service";

jest.mock("discord.js");

describe("PromptCommand", () => {
  let modelService: ModelService;
  let promptCommand: PromptCommand;
  let mockInteraction: jest.Mocked<ChatInputCommandInteraction>;

  beforeEach(() => {
    modelService = new ModelService();
    promptCommand = new PromptCommand(modelService);

    mockInteraction = {
      options: {
        getString: jest.fn(),
      },
      deferReply: jest.fn(),
      editReply: jest.fn(),
      reply: jest.fn(),
      replied: false,
      deferred: false,
    } as any;
  });

  describe("constructor", () => {
    it("should create command with correct data", () => {
      expect(promptCommand.data).toBeInstanceOf(SlashCommandBuilder);
      expect(promptCommand.data.name).toBe("prompt");
    });
  });

  describe("execute", () => {
    it("should execute with required prompt parameter", async () => {
      // Arrange
      (mockInteraction.options.getString as jest.Mock)
        .mockReturnValueOnce("test prompt")
        .mockReturnValueOnce(undefined);

      // Act
      await promptCommand.execute(mockInteraction);

      expect(mockInteraction.deferReply).toHaveBeenCalled();
      expect(mockInteraction.editReply).toHaveBeenCalled();
    });

    it("should use custom model when provided", async () => {
      // Arrange
      (mockInteraction.options.getString as jest.Mock)
        .mockReturnValueOnce("test prompt")
        .mockReturnValueOnce("gemini-2.5-flash-lite");
      const content = `**Model:** gemini-2.5-flash-lite\n**Prompt:** test prompt\n**Response:** This is a simulated response for prompt \"test prompt\" using model \"gemini-2.5-flash-lite\"`;

      // Act
      await promptCommand.execute(mockInteraction);

      // Assert
      expect(mockInteraction.editReply).toHaveBeenCalledWith({ content });
    });

    it("should handle invalid model gracefully", async () => {
      // Arrange
      (mockInteraction.options.getString as jest.Mock)
        .mockReturnValueOnce("test prompt")
        .mockReturnValueOnce("invalid-model");
      const content = "Invalid model selected";

      // Act
      await promptCommand.execute(mockInteraction);

      // Assert
      expect(mockInteraction.reply).toHaveBeenCalledWith({ content });
    });
  });

  describe("error handling", () => {
    it("should handle errors from model service", async () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Arrange
      (mockInteraction.options.getString as jest.Mock)
        .mockReturnValueOnce("test prompt")
        .mockReturnValueOnce("gemini-2.5-flash-lite");
      (mockInteraction.editReply as jest.Mock)
        .mockRejectedValueOnce(new Error("Reply error"))
        .mockRejectedValueOnce({} as any);

      // Act
      await promptCommand.execute(mockInteraction);

      // Assert
      expect(mockInteraction.reply).toHaveBeenCalledWith({
        content: "test prompt",
      });
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
