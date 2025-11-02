const { showOutput } = require('../src/outputFormatter');

describe('showOutput', () => {
  it('should return message when no events are found', () => {
    const res = { data: [] };
    expect(showOutput(res)).toBe('No events found for this user.');
  });

  it('should format PushEvent correctly', () => {
    const res = {
      data: [
        {
          actor: { display_login: 'octocat' },
          type: 'PushEvent',
          repo: { name: 'octo/repo' },
          created_at: '2023-10-01T12:00:00Z',
          payload: { commits: [{}, {}] }
        }
      ]
    };
    const output = showOutput(res);
    expect(output).toContain('octocat');
    expect(output).toContain('Pushed 2 commits to octo/repo');
  });

  it('should format DeleteEvent correctly', () => {
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
    const output = showOutput(res);
    expect(output).toContain('octocat');
    expect(output).toContain('Deleted branch named feature-branch from octo/repo');
  });

  it('should handle multiple events', () => {
    const res = {
      data: [
        {
          actor: { display_login: 'octocat' },
          type: 'PushEvent',
          repo: { name: 'octo/repo1' },
          created_at: '2023-10-01T12:00:00Z',
          payload: { commits: [{}, {}] }
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
    const output = showOutput(res);
    expect(output).toContain('Pushed 2 commits to octo/repo1');
    expect(output).toContain('Deleted branch named old-branch from octo/repo2');
  });
});