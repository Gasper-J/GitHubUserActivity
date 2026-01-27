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

  it('should handle unhandled event types', async () => {
    const res = {
      data: [
        {
          actor: { display_login: 'octocat' },
          type: 'UnknownEvent',
          repo: { name: 'octo/repo' },
          created_at: '2023-10-01T12:00:00Z',
          payload: {}
        }
      ]
    };
    const output = await showOutput(res);
    expect(output).toContain('Unhandled event type: UnknownEvent');
  });
  
  it('should format CommitCommentEvent correctly', async () => {
    const res = {
      data: [
        {
          actor: { display_login: 'octocat' },
          type: 'CommitCommentEvent',
          repo: { name: 'octo/repo' },
          created_at: '2023-10-01T12:00:00Z',
          payload: { action: 'created', commit_id: 'abc123456789' }
        }
      ]
    };
    const output = await showOutput(res);
    expect(output).toContain('Commented on commit abc1234 in octo/repo');
  });

  it('should format CreateEvent correctly for repository', async () => {
    const res = {
      data: [
        {
          actor: { display_login: 'octocat' },
          type: 'CreateEvent',
          repo: { name: 'octo/repo' },
          created_at: '2023-10-01T12:00:00Z',
          payload: { ref_type: 'repository' }
        }
      ]
    };
    const output = await showOutput(res);
    expect(output).toContain('Created repository octo/repo');
  });

  it('should format CreateEvent correctly for branch', async () => {
    const res = {
      data: [
        {
          actor: { display_login: 'octocat' },
          type: 'CreateEvent',
          repo: { name: 'octo/repo' },
          created_at: '2023-10-01T12:00:00Z',
          payload: { ref_type: 'branch', ref: 'feature-x' }
        }
      ]
    };
    const output = await showOutput(res);
    expect(output).toContain('Created branch feature-x in octo/repo');
  });

  it('should format CreateEvent correctly for tag', async () => {
    const res = {
      data: [
        {
          actor: { display_login: 'octocat' },
          type: 'CreateEvent',
          repo: { name: 'octo/repo' },
          created_at: '2023-10-01T12:00:00Z',
          payload: { ref_type: 'tag', ref: 'v1.0.0' }
        }
      ]
    };
    const output = await showOutput(res);
    expect(output).toContain('Created tag v1.0.0 in octo/repo');
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

  it('should format ForkEvent correctly', async () => {
    const res = {
      data: [
        {
          actor: { display_login: 'octocat' },
          type: 'ForkEvent',
          repo: { name: 'octo/repo' },
          created_at: '2023-10-01T12:00:00Z',
          payload: {}
        }
      ]
    };
    const output = await showOutput(res);
    expect(output).toContain('Forked octo/repo');
  });

  it('should format GollumEvent correctly', async () => {
    const res = {
      data: [
        {
          actor: { display_login: 'octocat' },
          type: 'GollumEvent',
          repo: { name: 'octo/repo' },
          created_at: '2023-10-01T12:00:00Z',
          payload: { pages: [{ page_name: 'Home' }] }
        }
      ]
    };
    const output = await showOutput(res);
    expect(output).toContain('Edited wiki page "Home" in octo/repo');
  });

  it('should format IssuesEvent correctly', async () => {
    const res = {
      data: [
        {
          actor: { display_login: 'octocat' },
          type: 'IssuesEvent',
          repo: { name: 'octo/repo' },
          created_at: '2023-10-01T12:00:00Z',
          payload: { action: 'opened', issue: { number: 42, title: 'Fix bug' } }
        }
      ]
    };
    const output = await showOutput(res);
    expect(output).toContain('Opened issue #42 "Fix bug" in octo/repo');
  });

  it('should format IssueCommentEvent correctly for issue', async () => {
    const res = {
      data: [
        {
          actor: { display_login: 'octocat' },
          type: 'IssueCommentEvent',
          repo: { name: 'octo/repo' },
          created_at: '2023-10-01T12:00:00Z',
          payload: { action: 'created', issue: { number: 42, pull_request: null } }
        }
      ]
    };
    const output = await showOutput(res);
    expect(output).toContain('Commented on issue #42 in octo/repo');
  });

  it('should format IssueCommentEvent correctly for pull request', async () => {
    const res = {
      data: [
        {
          actor: { display_login: 'octocat' },
          type: 'IssueCommentEvent',
          repo: { name: 'octo/repo' },
          created_at: '2023-10-01T12:00:00Z',
          payload: { action: 'created', issue: { number: 42, pull_request: {} } }
        }
      ]
    };
    const output = await showOutput(res);
    expect(output).toContain('Commented on pull request #42 in octo/repo');
  });

  it('should format MemberEvent correctly for added', async () => {
    const res = {
      data: [
        {
          actor: { display_login: 'octocat' },
          type: 'MemberEvent',
          repo: { name: 'octo/repo' },
          created_at: '2023-10-01T12:00:00Z',
          payload: { action: 'added', member: { login: 'helper' } }
        }
      ]
    };
    const output = await showOutput(res);
    expect(output).toContain('Added @helper as collaborator to octo/repo');
  });

  it('should format MemberEvent correctly for removed', async () => {
    const res = {
      data: [
        {
          actor: { display_login: 'octocat' },
          type: 'MemberEvent',
          repo: { name: 'octo/repo' },
          created_at: '2023-10-01T12:00:00Z',
          payload: { action: 'removed', member: { login: 'helper' } }
        }
      ]
    };
    const output = await showOutput(res);
    expect(output).toContain('Removed @helper from octo/repo');
  });

  it('should format PublicEvent correctly', async () => {
    const res = {
      data: [
        {
          actor: { display_login: 'octocat' },
          type: 'PublicEvent',
          repo: { name: 'octo/repo' },
          created_at: '2023-10-01T12:00:00Z',
          payload: {}
        }
      ]
    };
    const output = await showOutput(res);
    expect(output).toContain('Made octo/repo public');
  });

  it('should format PullRequestEvent correctly for opened', async () => {
    const res = {
      data: [
        {
          actor: { display_login: 'octocat' },
          type: 'PullRequestEvent',
          repo: { name: 'octo/repo' },
          created_at: '2023-10-01T12:00:00Z',
          payload: { action: 'opened', pull_request: { number: 42, title: 'Add feature' } }
        }
      ]
    };
    const output = await showOutput(res);
    expect(output).toContain('Opened pull request #42 "Add feature" in octo/repo');
  });

  it('should format PullRequestEvent correctly for merged', async () => {
    const res = {
      data: [
        {
          actor: { display_login: 'octocat' },
          type: 'PullRequestEvent',
          repo: { name: 'octo/repo' },
          created_at: '2023-10-01T12:00:00Z',
          payload: { action: 'closed', pull_request: { number: 42, title: 'Add feature', merged: true } }
        }
      ]
    };
    const output = await showOutput(res);
    expect(output).toContain('Merged pull request #42 "Add feature" in octo/repo');
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
  
  it('should handle PushEvent commit count failure', async () => {
    jest.spyOn(githubApi, 'getPushEventCommitCount').mockResolvedValue(null);

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
    expect(output).toContain('Pushed an unknown number of commits to octo/repo');
  });

  it('should format ReleaseEvent correctly', async () => {
    const res = {
      data: [
        {
          actor: { display_login: 'octocat' },
          type: 'ReleaseEvent',
          repo: { name: 'octo/repo' },
          created_at: '2023-10-01T12:00:00Z',
          payload: { release: { tag_name: 'v1.0.0' } }
        }
      ]
    };
    const output = await showOutput(res);
    expect(output).toContain('Released v1.0.0 for octo/repo');
  });

  it('should format WatchEvent correctly', async () => {
    const res = {
      data: [
        {
          actor: { display_login: 'octocat' },
          type: 'WatchEvent',
          repo: { name: 'octo/repo' },
          created_at: '2023-10-01T12:00:00Z',
          payload: {}
        }
      ]
    };
    const output = await showOutput(res);
    expect(output).toContain('Starred octo/repo');
  });
});