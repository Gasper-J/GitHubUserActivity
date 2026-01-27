jest.mock('readline-sync');
jest.mock('../logging');

const readlineSync = require('readline-sync');
const logger = require('../logging');
const { getUsername, getAmount, askSearchAgain } = require('../src/userInput');

// Mock console.log to avoid test output
const originalConsoleLog = console.log;
console.log = jest.fn();

describe('User Input Tests', () => {
  beforeAll(() => {
    console.log = jest.fn();
  });

  afterAll(() => {
    console.log = originalConsoleLog;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('getUsername', () => {
    it('returns user input', () => {
      readlineSync.question.mockReturnValue('octocat');
      expect(getUsername()).toBe('octocat');
      expect(logger.debug).toHaveBeenCalledWith('Prompting user for GitHub username.');
    });

    it('returns empty string when user enters nothing', () => {
      readlineSync.question.mockReturnValue('');
      expect(getUsername()).toBe('');
    });
  });

  describe('getAmount', () => {
    it('returns a valid number', () => {
      readlineSync.question.mockReturnValue('10');
      expect(getAmount()).toBe(10);
      expect(logger.debug).toHaveBeenCalledWith('Prompting user for number of events to display.');
      expect(logger.debug).toHaveBeenCalledWith('User entered valid number of events to display: 10');
    });

    it('accepts boundary values', () => {
      readlineSync.question.mockReturnValue('1');
      expect(getAmount()).toBe(1);

      readlineSync.question.mockReturnValue('50');
      expect(getAmount()).toBe(50);
    });

    it('handles invalid input and re-prompts until valid', () => {
      readlineSync.question
        .mockReturnValueOnce('abc')     // Invalid: not a number
        .mockReturnValueOnce('51')      // Invalid: too high
        .mockReturnValueOnce('0')       // Invalid: too low
        .mockReturnValueOnce('-5')      // Invalid: negative
        .mockReturnValueOnce('25');     // Valid

      expect(getAmount()).toBe(25);
      expect(readlineSync.question).toHaveBeenCalledTimes(5);
      expect(console.log).toHaveBeenCalledWith('Please enter a valid number between 1 and 50.');
      expect(logger.debug).toHaveBeenCalledWith('Invalid number entered for events amount, re-prompting user.');
    });

    it('handles empty input', () => {
      readlineSync.question
        .mockReturnValueOnce('')        // Invalid: empty
        .mockReturnValueOnce('10');     // Valid

      expect(getAmount()).toBe(10);
      expect(readlineSync.question).toHaveBeenCalledTimes(2);
    });
  });

  describe('askSearchAgain', () => {
    it('returns true for "Y" input', () => {
      readlineSync.question.mockReturnValue('Y');
      expect(askSearchAgain()).toBe(true);
      expect(logger.debug).toHaveBeenCalledWith('Prompting user to search for another GitHub user.');
    });

    it('returns false for "N" input', () => {
      readlineSync.question.mockReturnValue('N');
      expect(askSearchAgain()).toBe(false);
    });

    it('returns true for lowercase "y"', () => {
      readlineSync.question.mockReturnValue('y');
      expect(askSearchAgain()).toBe(true);
    });

    it('returns false for lowercase "n"', () => {
      readlineSync.question.mockReturnValue('n');
      expect(askSearchAgain()).toBe(false);
    });

    it('returns false for empty input', () => {
      readlineSync.question.mockReturnValue('');
      expect(askSearchAgain()).toBe(false);
    });

    it('returns false for whitespace input', () => {
      readlineSync.question.mockReturnValue('   ');
      expect(askSearchAgain()).toBe(false);
    });

    it('returns false for invalid inputs', () => {
      readlineSync.question.mockReturnValue('yes');
      expect(askSearchAgain()).toBe(false);

      readlineSync.question.mockReturnValue('maybe');
      expect(askSearchAgain()).toBe(false);

      readlineSync.question.mockReturnValue('123');
      expect(askSearchAgain()).toBe(false);
    });
  });
});