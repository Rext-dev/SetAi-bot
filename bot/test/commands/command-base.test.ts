import { CommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { BaseCommand } from "../../src/commands/base/command";
import { mock, MockProxy } from "jest-mock-extended";

class BasicCommand extends BaseCommand {
  public data: SlashCommandBuilder;
  constructor() {
    super();
    this.data = new SlashCommandBuilder()
      .setName("test")
      .setDescription("TestDescription");
  }
  public async execute(interaction: CommandInteraction): Promise<void> {
    const content = "Testing";
    await this.safeReply(interaction, content);
  }
}

describe("Testing base command behavior", () => {
  let mockInteraction: MockProxy<CommandInteraction>;
  let commandInstance: BaseCommand;

  beforeEach(() => {
    mockInteraction = mock<CommandInteraction>();
    mockInteraction.replied = false;
    mockInteraction.deferred = false;

    mockInteraction.reply.mockResolvedValue({} as any);
    mockInteraction.followUp.mockResolvedValue({} as any);

    commandInstance = new BasicCommand();
  });

  it("calls reply when interaction is not replied or deferred", async () => {
    await commandInstance.execute(
      mockInteraction as unknown as CommandInteraction
    );

    expect(mockInteraction.reply).toHaveBeenCalledWith({ content: "Testing" });
    expect(mockInteraction.followUp).not.toHaveBeenCalled();
  });

  it("calls followUp when interaction is deferred", async () => {
    mockInteraction.deferred = true;
    await commandInstance.execute(
      mockInteraction as unknown as CommandInteraction
    );

    expect(mockInteraction.followUp).toHaveBeenCalledWith({
      content: "Testing",
    });
    expect(mockInteraction.reply).not.toHaveBeenCalled();
  });

  it("Manage throw errors", async () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    mockInteraction.reply.mockRejectedValue(new Error("Reply error"));

    await commandInstance.execute(
      mockInteraction as unknown as CommandInteraction
    );

    expect(mockInteraction.reply).toHaveBeenCalledWith({ content: "Testing" });
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
