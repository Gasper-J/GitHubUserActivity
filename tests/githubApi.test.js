jest.mock('axios');

const axios = require('axios');
const { axiosWithRetry } = require('../src/githubApi');

describe('GitHub API Retry Logic', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should retry on ECONNABORTED error', async () => {
    axios.mockRejectedValue({ code: 'ECONNABORTED' });
    await expect(axiosWithRetry('https://api.github.com/users/octocat/events', {})).rejects.toEqual({ code: 'ECONNABORTED' });
    expect(axios).toHaveBeenCalledTimes(3); // Default retries is 3
  });

  test('should retry on ENOTFOUND error', async () => {
    axios.mockRejectedValue({ code: 'ENOTFOUND' });
    await expect(axiosWithRetry('https://api.github.com/users/octocat/events', {})).rejects.toEqual({ code: 'ENOTFOUND' });
    expect(axios).toHaveBeenCalledTimes(3);
  });

  test('should not retry on client errors (4xx)', async () => {
    axios.mockImplementationOnce(() => Promise.reject({ response: { status: 404 } }));
    await expect(axiosWithRetry('https://api.github.com/users/octocat/events', {})).rejects.toEqual({ response: { status: 404 } });
    expect(axios).toHaveBeenCalledTimes(1);
  });

  test('should not retry on non-retryable server errors (5xx)', async () => {
    axios.mockImplementationOnce(() => Promise.reject({ response: { status: 500 } }));
    await expect(axiosWithRetry('https://api.github.com/users/octocat/events', {})).rejects.toEqual({ response: { status: 500 } });
    expect(axios).toHaveBeenCalledTimes(1);
  });

  test('should succeed on valid request', async () => {
    const mockResponse = { data: [{ id: 1, type: 'PushEvent' }] };
    axios.mockResolvedValue(mockResponse);
    const response = await axiosWithRetry('https://api.github.com/users/octocat/events', {});
    expect(response).toEqual(mockResponse);
    expect(axios).toHaveBeenCalledTimes(1);
  });
});