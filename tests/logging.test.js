const fs = require('fs');
const path = require('path');

// Mock fs and path
jest.mock('fs');
jest.mock('path');

describe('logging', () => {
  let logging;
  let mockStream;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock process.cwd
    jest.spyOn(process, 'cwd').mockReturnValue('/mock/cwd');
    
    // Mock path.join
    path.join.mockImplementation((...args) => args.join('/'));
    
    // Mock fs methods
    fs.existsSync.mockReturnValue(false);
    fs.mkdirSync.mockReturnValue(undefined);
    mockStream = { write: jest.fn() };
    fs.createWriteStream.mockReturnValue(mockStream);
    
    // Mock Date
    jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2023-01-01T00:00:00.000Z');

    if (!logging) {
      logging = require('../logging');
    }
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initLogger', () => {
    it('should create log directory and stream when not exists', () => {
      fs.existsSync.mockReturnValue(false);
      
      logging.initLogger({ enableVerbose: true });
      
      expect(fs.existsSync).toHaveBeenCalledWith('/mock/cwd/logs');
      expect(fs.mkdirSync).toHaveBeenCalledWith('/mock/cwd/logs', { recursive: true });
      expect(fs.createWriteStream).toHaveBeenCalledWith('/mock/cwd/logs/app.log', { flags: 'a' });
    });

    it('should not create directory if it exists', () => {
      fs.existsSync.mockReturnValue(true);
      
      logging.initLogger();
      
      expect(fs.mkdirSync).not.toHaveBeenCalled();
      expect(fs.createWriteStream).toHaveBeenCalledWith('/mock/cwd/logs/app.log', { flags: 'a' });
    });
  });

  describe('maskSensitiveInfo', () => {
    it('should return copy of headers without modification if no Authorization', () => {
      const headers = { 'Content-Type': 'application/json' };
      const result = logging.maskSensitiveInfo(headers);
      
      expect(result).toEqual(headers);
      expect(result).not.toBe(headers); // Should be a copy
    });

    it('should mask Authorization header', () => {
      const headers = { 'Authorization': 'Bearer token123', 'Content-Type': 'application/json' };
      const result = logging.maskSensitiveInfo(headers);
      
      expect(result['Authorization']).toBe('[REDACTED]');
      expect(result['Content-Type']).toBe('application/json');
      expect(result).not.toBe(headers);
    });
  });

  describe('exported functions', () => {
    it('info should write to stream', () => {
      logging.initLogger();
      
      logging.info('Info message');
      
      expect(mockStream.write).toHaveBeenCalledWith('[2023-01-01T00:00:00.000Z] [INFO] Info message\n');
    });

    it('warn should write to stream', () => {
      logging.initLogger();
      
      logging.warn('Warn message');
      
      expect(mockStream.write).toHaveBeenCalledWith('[2023-01-01T00:00:00.000Z] [WARN] Warn message\n');
    });

    it('error should write to stream', () => {
      logging.initLogger();
      
      logging.error('Error message');
      
      expect(mockStream.write).toHaveBeenCalledWith('[2023-01-01T00:00:00.000Z] [ERROR] Error message\n');
    });

    it('debug should not write when verbose is false', () => {
      logging.initLogger({ enableVerbose: false });
      
      logging.debug('Debug message');
      
      expect(mockStream.write).not.toHaveBeenCalled();
    });

    it('debug should write when verbose is true', () => {
      logging.initLogger({ enableVerbose: true });
      
      logging.debug('Debug message');
      
      expect(mockStream.write).toHaveBeenCalledWith('[2023-01-01T00:00:00.000Z] [DEBUG] Debug message\n');
    });
  });
});