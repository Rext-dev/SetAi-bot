import { PromptCommand } from "../commands/implementations/prompt-command";
import { CommandRegistry } from "../services/command-registry-service";
import { ModelService } from "../services/models-service";
import { BotConfig } from "../types/bot.types";
import { BotClient } from "./bot-client";

export class Bot {
  private client: BotClient;
  private commandRegistry: CommandRegistry;
  private modelService: ModelService;

  constructor(private config: BotConfig) {
    this.client = new BotClient();
    this.commandRegistry = new CommandRegistry(config);
    this.modelService = new ModelService();

    this.initializeCommands();
  }

  private initializeCommands(): void {
    // TODO: implement OCP
    const promptCommand = new PromptCommand(this.modelService);

    this.commandRegistry.registerCommand(promptCommand);
    this.client.addCommand(promptCommand);
  }

  public async start(): Promise<void> {
    try {
      await this.commandRegistry.deployCommands();

      await this.client.login(this.config.token);
    } catch (error) {
      console.error("Error starting bot:", error);
      process.exit(1);
    }
  }

  public async stop(): Promise<void> {
    this.client.destroy();
  }
}
