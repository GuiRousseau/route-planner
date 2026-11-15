import { createApp } from './infrastructure/create-app.ts';

const PORT = 3000;

async function main(): Promise<void> {
  const app = await createApp();
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

main().catch((error: unknown) => {
  console.error('Server startup failed:', error);
  process.exitCode = 1;
});
