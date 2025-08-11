import 'dotenv/config';
import { createClient } from './services/client';

async function main() {
  const token = process.env.DISCORD_TOKEN;
  if (!token) {
    console.error('Falta DISCORD_TOKEN en el entorno. Crea .env a partir de .env.example');
    process.exit(1);
  }

  const client = createClient();
  await client.login(token);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
