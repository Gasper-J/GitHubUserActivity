jest.mock('axios');
jest.mock('../logging');

const axios = require('axios');
const logger = require('../logging');
const { axiosWithRetry, getUserEvents, getPushEventCommitCount } = require('../src/githubApi');

// Store original console.log
const originalConsoleLog = console.log;

describe('GitHub API Functions', () => {
  beforeAll(() => {
    // Set up test environment
    process.env.API_KEY = 'test-token';
    // Mock console.log to avoid test output
    console.log = jest.fn();
  });

  afterAll(() => {
    // Restore original console.log
    console.log = originalConsoleLog;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('axiosWithRetry', () => {
    it('should retry on ECONNABORTED error', async () => {
      axios.mockRejectedValue({ code: 'ECONNABORTED' });
      await expect(axiosWithRetry('https://api.github.com/users/octocat/events', {})).rejects.toEqual({ code: 'ECONNABORTED' });
      expect(axios).toHaveBeenCalledTimes(3); // Default retries is 3
    });

    it('should retry on ENOTFOUND error', async () => {
      axios.mockRejectedValue({ code: 'ENOTFOUND' });
      await expect(axiosWithRetry('https://api.github.com/users/octocat/events', {})).rejects.toEqual({ code: 'ENOTFOUND' });
      expect(axios).toHaveBeenCalledTimes(3);
    });

    it('should not retry on client errors (4xx)', async () => {
      axios.mockImplementationOnce(() => Promise.reject({ response: { status: 404 } }));
      await expect(axiosWithRetry('https://api.github.com/users/octocat/events', {})).rejects.toEqual({ response: { status: 404 } });
      expect(axios).toHaveBeenCalledTimes(1);
    });

    it('should retry on retryable server errors (500, 502, 503, 504)', async () => {
      // Test 500 - Internal Server Error
      axios.mockRejectedValue({ response: { status: 500 } });
      await expect(axiosWithRetry('https://api.github.com/users/octocat/events', {})).rejects.toEqual({ response: { status: 500 } });
      expect(axios).toHaveBeenCalledTimes(3);
    });

    it('should retry on rate limit exceeded (429)', async () => {
      axios.mockRejectedValue({ response: { status: 429 } });
      await expect(axiosWithRetry('https://api.github.com/users/octocat/events', {})).rejects.toEqual({ response: { status: 429 } });
      expect(axios).toHaveBeenCalledTimes(3);
    });

    it('should not retry on non-retryable server errors', async () => {
      // Test 501 - Not Implemented (not in RETRYABLE_STATUS_CODES)
      axios.mockImplementationOnce(() => Promise.reject({ response: { status: 501 } }));
      await expect(axiosWithRetry('https://api.github.com/users/octocat/events', {})).rejects.toEqual({ response: { status: 501 } });
      expect(axios).toHaveBeenCalledTimes(1);
    });

    it('should succeed on valid request', async () => {
      const mockResponse = { data: [{ id: 1, type: 'PushEvent' }] };
      axios.mockResolvedValue(mockResponse);
      const response = await axiosWithRetry('https://api.github.com/users/octocat/events', {});
      expect(response).toEqual(mockResponse);
      expect(axios).toHaveBeenCalledTimes(1);
    });

    it('should retry up to max attempts and then fail', async () => {
      axios.mockRejectedValue({ response: { status: 500 } });
      await expect(axiosWithRetry('https://api.github.com/users/octocat/events', {}, 2)).rejects.toEqual({ response: { status: 500 } });
      expect(axios).toHaveBeenCalledTimes(2); // Custom retry count of 2
    });
  });

  describe('getUserEvents', () => {
    it('should successfully fetch user events', async () => {
      const mockResponse = {
        data: [
          { id: 1, type: 'PushEvent', actor: { display_login: 'octocat' } }
        ],
        headers: { 'x-ratelimit-remaining': '4999' }
      };
      axios.mockResolvedValue(mockResponse);

      const result = await getUserEvents('octocat', 10);

      expect(result).toEqual(mockResponse);
      expect(axios).toHaveBeenCalledWith(
        'https://api.github.com/users/octocat/events/public',
        expect.objectContaining({
          method: 'get',
          headers: expect.objectContaining({
            'Accept': 'application/json',
            'User-Agent': 'GasperJ-GitHub-User-Activity',
            'Authorization': 'Bearer test-token'
          }),
          params: { per_page: 10 },
          timeout: 5000
        })
      );
      expect(logger.info).toHaveBeenCalledWith('Starting GitHub user events retrieval process.');
      expect(logger.debug).toHaveBeenCalledWith('Fetching user events', { username: 'octocat', amount: 10 });
    });

    it('should handle rate limit exceeded', async () => {
      const mockResponse = {
        data: [],
        headers: { 'x-ratelimit-remaining': '0' }
      };
      axios.mockResolvedValue(mockResponse);

      const result = await getUserEvents('octocat', 10);

      expect(result).toBeUndefined();
      expect(logger.warn).toHaveBeenCalledWith('Rate limit exceeded', { username: 'octocat' });
      expect(console.log).toHaveBeenCalledWith('GitHub API rate limit exceeded. Please wait before retrying.');
    });

    it('should handle API errors gracefully', async () => {
      const mockError = {
        response: { data: 'Not Found' },
        message: 'Request failed',
        stack: 'Error stack'
      };
      axios.mockRejectedValue(mockError);

      const result = await getUserEvents('nonexistentuser', 10);

      expect(result).toBeUndefined();
      expect(logger.error).toHaveBeenCalledWith('API request failed', {
        username: 'nonexistentuser',
        error: 'Not Found',
        stack: 'Error stack'
      });
      expect(console.log).toHaveBeenCalledWith('Request failed: ', 'Not Found');
    });

    it('should handle network errors', async () => {
      axios.mockRejectedValue(new Error('Network Error'));

      const result = await getUserEvents('octocat', 10);

      expect(result).toBeUndefined();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('getPushEventCommitCount', () => {
    it('should successfully get commit count using total_commits', async () => {
      const mockResponse = {
        data: { total_commits: 5 },
        headers: { 'x-ratelimit-remaining': '4999' }
      };
      axios.mockResolvedValue(mockResponse);

      const result = await getPushEventCommitCount('abc123', 'def456', 'octocat/repo');

      expect(result).toBe(5);
      expect(axios).toHaveBeenCalledWith(
        'https://api.github.com/repos/octocat/repo/compare/abc123...def456',
        expect.objectContaining({
          method: 'get',
          headers: expect.objectContaining({
            'Accept': 'application/json',
            'User-Agent': 'GasperJ-GitHub-User-Activity',
            'Authorization': 'Bearer test-token'
          }),
          timeout: 5000
        })
      );
    });

    it('should fall back to commits array length when total_commits not available', async () => {
      const mockResponse = {
        data: { commits: [{}, {}, {}] },
        headers: { 'x-ratelimit-remaining': '4999' }
      };
      axios.mockResolvedValue(mockResponse);

      const result = await getPushEventCommitCount('abc123', 'def456', 'octocat/repo');

      expect(result).toBe(3);
    });

    it('should return null for invalid repo name format', async () => {
      const result = await getPushEventCommitCount('abc123', 'def456', 'invalidrepo');

      expect(result).toBeNull();
      expect(axios).not.toHaveBeenCalled();
    });

    it('should return null for empty repo name', async () => {
      const result = await getPushEventCommitCount('abc123', 'def456', '');

      expect(result).toBeNull();
      expect(axios).not.toHaveBeenCalled();
    });

    it('should handle rate limit exceeded', async () => {
      const mockResponse = {
        data: { total_commits: 3 },
        headers: { 'x-ratelimit-remaining': '0' }
      };
      axios.mockResolvedValue(mockResponse);

      const result = await getPushEventCommitCount('abc123', 'def456', 'octocat/repo');

      expect(result).toBeNull();
      expect(logger.warn).toHaveBeenCalledWith('Rate limit exceeded for compare API.', { repoName: 'octocat/repo' });
      expect(console.log).toHaveBeenCalledWith('GitHub API rate limit exceeded. Please wait before retrying.');
    });

    it('should handle API errors and return null', async () => {
      const mockError = {
        response: { data: 'Comparison failed' },
        message: 'API Error',
        stack: 'Error stack'
      };
      axios.mockRejectedValue(mockError);

      const result = await getPushEventCommitCount('abc123', 'def456', 'octocat/repo');

      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalledWith('Compare API request failed', {
        repoName: 'octocat/repo',
        error: 'Comparison failed',
        stack: 'Error stack'
      });
      expect(console.log).toHaveBeenCalledWith('Failed fetching compare: ', 'Comparison failed');
    });

    it('should handle network errors and return null', async () => {
      axios.mockRejectedValue(new Error('Network Error'));

      const result = await getPushEventCommitCount('abc123', 'def456', 'octocat/repo');

      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalled();
    });

    it('should return null when response data is malformed', async () => {
      const mockResponse = {
        data: null,
        headers: { 'x-ratelimit-remaining': '4999' }
      };
      axios.mockResolvedValue(mockResponse);

      const result = await getPushEventCommitCount('abc123', 'def456', 'octocat/repo');

      expect(result).toBeNull();
    });
  });
});