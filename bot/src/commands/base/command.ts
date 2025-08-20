import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { ICommand } from "../../types/bot.types";

export abstract class BaseCommand implements ICommand {
  public abstract data: SlashCommandBuilder;

  public abstract execute(interaction: CommandInteraction): Promise<void>;

  protected async safeReply(
    interaction: CommandInteraction,
    content: string
  ): Promise<void> {
    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content });
      } else {
        await interaction.reply({ content });
      }
    } catch (error) {
      console.error("Error replying to interaction:", error);
    }
  }
}
