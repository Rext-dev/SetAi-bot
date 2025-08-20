import dotenv from "dotenv";
import { BotConfig } from "./types/bot.types";
import { Bot } from "./bot/bot";

dotenv.config();

const config: BotConfig = {
  token: process.env.DISCORD_TOKEN!,
  clientId: process.env.CLIENT_ID!,
};

// TODO: move to /src/config/*.ts
if (!config.token || !config.clientId) {
  console.error(
    "missing required environment variables: DISCORD_TOKEN, CLIENT_ID"
  );
  process.exit(1);
}

const bot = new Bot(config);

process.on("SIGINT", async () => {
  console.log("Shutting down bot...");
  await bot.stop();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Shutting down bot...");
  await bot.stop();
  process.exit(0);
});

bot.start().catch(console.error);
