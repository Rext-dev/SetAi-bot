import { REST, Routes } from "discord.js";
import { BotConfig, ICommand, ICommandRegistry } from "../types/bot.types";

export class CommandRegistry implements ICommandRegistry {
  private commands: ICommand[] = [];
  private rest: REST;

  constructor(private config: BotConfig) {
    this.rest = new REST().setToken(config.token);
  }
  public registerCommand(command: ICommand): void {
    this.commands.push(command);
  }
  public getCommands(): ICommand[] {
    return [...this.commands];
  }

  public async deployCommands(): Promise<void> {
    try {
      console.log(
        `Started refreshing ${this.commands.length} application (/) commands`
      );

      const commandData = this.commands.map((command) => command.data.toJSON());

      const route = this.config.guildId
        ? Routes.applicationGuildCommands(
            this.config.clientId,
            this.config.guildId
          )
        : Routes.applicationCommands(this.config.clientId);

      const data = (await this.rest.put(route, { body: commandData })) as any[];
      console.log(
        `Successfully reloaded ${data.length} application (/) commands.`
      );
    } catch (error) {
      console.error("Error deploying commands", error);
    }
  }
}
