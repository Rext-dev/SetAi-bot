import { Client, Collection, Events, GatewayIntentBits } from "discord.js";
import { ICommand } from "../types/bot.types";

export class BotClient extends Client {
  public commands: Collection<string, ICommand>;

  constructor() {
    super({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
    });

    this.commands = new Collection();
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.once(Events.ClientReady, (client) => {
      console.log(`Bot is ready!, logged in as ${client.user.tag}`);
    });

    this.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      const command = this.commands.get(interaction.commandName);
      if (!command) {
        console.error(
          `No command matching ${interaction.commandName} was found.`
        );
        return;
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(`Error executing ${interaction.commandName}:`, error);

        const errorMessage = "There was an error while executing this command!";
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            content: errorMessage,
            ephemeral: true,
          });
        } else {
          await interaction.reply({ content: errorMessage, ephemeral: true });
        }
      }
    });
  }

  public addCommand(command: ICommand): void {
    this.commands.set(command.data.name, command);
  }
}
