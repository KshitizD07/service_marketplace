/**
 * @file server.js
 * @description HTTP Server bootloader and entrypoint.
 * Tests persistence health and binds Express to the configured network port.
 */

const app = require('./app');
const env = require('./config/env');
const { checkDatabaseHealth } = require('./config/db');

async function bootstrap() {
  // Probe database connectivity status
  const dbHealth = await checkDatabaseHealth();

  const server = app.listen(env.PORT, () => {
    console.log("=================================================");
    console.log(` Service Marketplace Backend API`);
    console.log(` Environment : ${env.NODE_ENV}`);
    console.log(` Server URL  : http://localhost:${env.PORT}`);
    console.log(` Health Check: http://localhost:${env.PORT}/api/health`);
    console.log(` DB Mode     : ${dbHealth.mode.toUpperCase()}`);
    console.log(` DB Status   : ${dbHealth.message}`);
    console.log("=================================================");
  });

  // Graceful shutdown handling
  const shutdown = (signal) => {
    console.log(`\n[SHUTDOWN] Received ${signal}. Closing HTTP server cleanly...`);
    server.close(() => {
      console.log("[SHUTDOWN] HTTP server closed.");
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch(err => {
  console.error("[FATAL] Server bootstrap failed:", err);
  process.exit(1);
});
