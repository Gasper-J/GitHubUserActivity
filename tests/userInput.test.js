jest.mock('readline-sync');

const readlineSync = require('readline-sync');
const { getUsername, getAmount, askSearchAgain } = require('../src/userInput');

describe('User Input Tests', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});
	
	test('getUsername returns user input', () => {
		readlineSync.question.mockReturnValue('octocat');
		expect(getUsername()).toBe('octocat');
	});

	test('getAmount returns a valid number', () => {
		readlineSync.question.mockReturnValue('10');
		expect(getAmount()).toBe(10);
	});

	test('getAmount handles invalid input', () => {
		readlineSync.question
			.mockReturnValueOnce('abc') // Invalid input
			.mockReturnValueOnce('51')  // Invalid input
			.mockReturnValueOnce('0')  // Invalid input
			.mockReturnValueOnce('5');  // Valid input
		expect(getAmount()).toBe(5);
		expect(readlineSync.question).toHaveBeenCalledTimes(4);
	});

	test('askSearchAgain returns true for "Y" input', () => {
		readlineSync.question.mockReturnValue('Y');
		expect(askSearchAgain()).toBe(true);
	});

	test('askSearchAgain returns false for "N" input', () => {
		readlineSync.question.mockReturnValue('N');
		expect(askSearchAgain()).toBe(false);
	});
});