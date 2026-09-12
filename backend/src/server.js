import app from './app.js';
import { env } from './config/env.js';
import { disconnectPrisma } from './config/database.js';
import { closeRedis } from './config/redis.js';

const server = app.listen(env.PORT, () => {
  console.log(`====================================================`);
  console.log(` ToyxonaHub Backend Running in [${env.NODE_ENV}] mode`);
  console.log(` Local Server: http://localhost:${env.PORT}`);
  console.log(` Swagger Docs: http://localhost:${env.PORT}/api-docs`);
  console.log(`====================================================`);
});

const gracefulShutdown = async (signal) => {
  console.log(`\nReceived ${signal}. Gracefully shutting down...`);
  server.close(async () => {
    console.log('HTTP server closed.');
    try {
      await disconnectPrisma();
      console.log('Prisma client disconnected.');
      await closeRedis();
      console.log('Redis client disconnected.');
      process.exit(0);
    } catch (err) {
      console.error('Error during database/redis disconnect:', err);
      process.exit(1);
    }
  });

  // Force close after 10s if connections linger
  setTimeout(() => {
    console.error('Forcefully shutting down after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
