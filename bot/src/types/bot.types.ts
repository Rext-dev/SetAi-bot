import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export interface ICommand {
  data: SlashCommandBuilder;
  execute(interaction: CommandInteraction): Promise<void>;
}

export interface ICommandRegistry {
  registerCommand(command: ICommand): void;
  getCommands(): ICommand[];
}

export interface IModelService {
  getAvailableModels(): ModelOption[];
  getDefaultModel(): string;
  isValidModel(model: string): boolean;
}

export interface ModelOption {
  name: string;
  value: string;
}

export interface BotConfig {
  token: string;
  clientId: string;
  guildId?: string;
}
