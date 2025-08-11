import { Client, GatewayIntentBits, Partials, type Message } from "discord.js";
import { getCommand } from "../commands";

export function createClient() {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Channel],
  });

  const prefix = process.env.PREFIX ?? "!";

  client.once("ready", () => {
    console.log(`Ready! Logged in as ${client.user?.tag}`);
  });

  client.on("messageCreate", async (msg: Message) => {
    if (msg.author.bot || !msg.content.startsWith(prefix)) return;
    const [command, ...args] = msg.content
      .slice(prefix.length)
      .trim()
      .split(/\s+/);

    const handler = getCommand(command);
    if (!handler) return;
    const response = await handler(args);
    if (response) await msg.reply(response);
  });

  return client;
}
