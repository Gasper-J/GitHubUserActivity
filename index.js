require('dotenv').config();

const logger = require('./logging');
const { axiosWithRetry, getUserEvents, getPushEventCommitCount } = require('./src/githubApi');

// Check if user enabled --verbose
const enableVerbose = process.argv.includes('--verbose') || process.argv.includes('-v');

logger.initLogger({ enableVerbose });

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', { message: err.message, stack: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection at:', { reason: reason?.message || reason, stack: reason?.stack });
  process.exit(1);
});

logger.info('CLI started.', { args: process.argv.slice(2) });

getUserEvents();