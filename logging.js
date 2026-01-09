const { time } = require("console");
const fs = require("fs");
const path = require("path");

const logDir = path.join(process.cwd(), 'logs');
const logFile = path.join(logDir, 'app.log');

let stream;
let verbose = false;

function initLogger({ enableVerbose = false } = {}) {
  verbose = enableVerbose;

  if (!fs.existsSync(logDir)){
      fs.mkdirSync(logDir, { recursive: true });
  }

  stream = fs.createWriteStream(logFile, { flags: 'a' });
}

function formatMeta(meta) {
  if (!meta || Object.keys(meta).length === 0) return '';

  return ` ${JSON.stringify(meta)}`;
}

function log(level, message, meta = {}) {
  if (!stream) {
    throw new Error("Logger not initialized. Call initLogger() first.");
  }

  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] [${level.toUpperCase()}] ${message}${formatMeta(meta)}`;
  
  stream.write(entry + "\n");

  // Log to console
  // if (level === 'error') console.error(message);
  // else if (level === 'warn') console.warn(message);
  // else if (level === 'debug' && verbose) console.debug(message);
  // else if (level === 'info') console.info(message);
}

function maskSensitiveInfo(headers) {
  const safeHeaders = { ...headers };
  if (safeHeaders['Authorization']) {
    safeHeaders['Authorization'] = '[REDACTED]';
  }
  return safeHeaders;
}

module.exports = { 
  initLogger,
  info: (msg, meta) => log('info', msg, meta),
  warn: (msg, meta) => log('warn', msg, meta),
  error: (msg, meta) => log('error', msg, meta),
  debug: (msg, meta) => log('debug', msg, meta),
  maskSensitiveInfo
 };