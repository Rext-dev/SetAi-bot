import 'dotenv/config';
// Import ESM con extensión .js para que Node lo resuelva tras compilar
import { createClient } from './services/client.js';

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
