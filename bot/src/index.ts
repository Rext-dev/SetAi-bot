import 'dotenv/config';
// Import ESM con extensión .js para que Node lo resuelva tras compilar
import { createClient } from './services/client';

export async function main(getClient: () => { login: (t: string) => Promise<any> } = createClient) {
  const token = process.env.DISCORD_TOKEN;
  if (!token) {
    console.error('Falta DISCORD_TOKEN en el entorno. Crea .env a partir de .env.example');
    throw new Error('MISSING_DISCORD_TOKEN');
  }
  const client = getClient();
  await client.login(token);
  return client;
}

// Ejecutar sólo cuando se invoca directamente (no en tests)
// CommonJS: require.main === module
// (TS compila a CJS según tsconfig actual)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const module: any; // para evitar tipos faltantes en CJS
declare const require: any;
if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}
