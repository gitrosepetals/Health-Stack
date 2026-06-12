import 'dotenv/config';
import { createApp } from './app';
import { env } from './lib/env';

const app = createApp();

app.listen(env.port, () => {
  console.log(`Lumen API (Node.js) → http://localhost:${env.port}`);
  console.log(`  Health   GET  /api/health`);
  console.log(`  Articles GET  /api/articles`);
  console.log(`  Subscribe POST /api/subscribe`);
  console.log(`  Contact  POST /api/contact`);
});
