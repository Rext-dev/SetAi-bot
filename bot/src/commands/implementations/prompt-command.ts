import { ChatInputCommandInteraction, CommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { BaseCommand } from "../base/command";
import { IModelService } from "../../types/bot.types";

export class PromptCommand extends BaseCommand {
  public data: SlashCommandBuilder;

  constructor(private modelService: IModelService) {
    super();
    this.data = new SlashCommandBuilder()
      .setName("prompt")
      .setDescription("Send a prompt with an optional model selection")
      .addStringOption((option) =>
        option.setName("prompt").setDescription("Prompt text").setRequired(true)
      )
      .addStringOption((option) => {
        const modelOption = option
          .setName("model")
          .setDescription("AI model to use (optional)")
          .setRequired(false);

        this.modelService.getAvailableModels().forEach((model) => {
          modelOption.addChoices({ name: model.name, value: model.value });
        });
        return modelOption;
      }) as SlashCommandBuilder;
  }

  public async execute(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    await interaction.deferReply();
    const prompt = interaction.options.getString("prompt", true);
    const selectedModel =
      interaction.options.getString("model") ||
      this.modelService.getDefaultModel();

    if (!this.modelService.isValidModel(selectedModel)) {
      await this.safeReply(interaction, "Invalid model selected");
      return;
    }

    await this.processPrompt(interaction, prompt, selectedModel);
  }

  private async processPrompt(
    interaction: CommandInteraction,
    prompt: string,
    model: string
  ): Promise<void> {
    try {
      const response = await this.generateResponse(prompt, model);

      await interaction.editReply({
        content: `**Model:** ${model}\n**Prompt:** ${prompt}\n**Response:** ${response}`,
      });
    } catch (error) {
      console.error("Error processing prompt:", error);
      await interaction.editReply(
        "Sorry, there was an error processing your prompt."
      );
    }
  }

  private async generateResponse(
    prompt: string,
    model: string
  ): Promise<string> {
    return `This is a simulated response for prompt "${prompt}" using model "${model}"`;
  }
}
