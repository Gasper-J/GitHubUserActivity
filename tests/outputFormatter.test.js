const { showOutput } = require('../src/outputFormatter');
const githubApi = require('../src/githubApi');

describe('showOutput', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return message when no events are found', async () => {
    const res = { data: [] };
    const output = await showOutput(res);
    expect(output).toBe('No public events found for this user in the last 90 days.');
  });

  it('should format PushEvent correctly', async () => {
    // mock the compare helper to avoid network calls
    jest.spyOn(githubApi, 'getPushEventCommitCount').mockResolvedValue(2);

    const res = {
      data: [
        {
          actor: { display_login: 'octocat' },
          type: 'PushEvent',
          repo: { name: 'octo/repo' },
          created_at: '2023-10-01T12:00:00Z',
          payload: { commits: [{}, {}], head: 'abc', before: 'def' }
        }
      ]
    };
    const output = await showOutput(res);
    expect(output).toContain('octocat');
    expect(output).toContain('Pushed 2 commits to octo/repo');
  });

  it('should format DeleteEvent correctly', async () => {
    const res = {
      data: [
        {
          actor: { display_login: 'octocat' },
          type: 'DeleteEvent',
          repo: { name: 'octo/repo' },
          created_at: '2023-10-01T12:00:00Z',
          payload: { ref: 'feature-branch', ref_type: 'branch' }
        }
      ]
    };
    const output = await showOutput(res);
    expect(output).toContain('octocat');
    expect(output).toContain('Deleted branch named feature-branch from octo/repo');
  });

  it('should handle multiple events', async () => {
    // mock compare helper for the push event
    jest.spyOn(githubApi, 'getPushEventCommitCount').mockResolvedValue(2);

    const res = {
      data: [
        {
          actor: { display_login: 'octocat' },
          type: 'PushEvent',
          repo: { name: 'octo/repo1' },
          created_at: '2023-10-01T12:00:00Z',
          payload: { commits: [{}, {}], head: 'abc', before: 'def' }
        },
        {
          actor: { display_login: 'octocat' },
          type: 'DeleteEvent',
          repo: { name: 'octo/repo2' },
          created_at: '2023-10-01T13:00:00Z',
          payload: { ref: 'old-branch', ref_type: 'branch' }
        }
      ]
    };
    const output = await showOutput(res);
    expect(output).toContain('Pushed 2 commits to octo/repo1');
    expect(output).toContain('Deleted branch named old-branch from octo/repo2');
  });
});