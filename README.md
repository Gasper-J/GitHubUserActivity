# GitHub User Activity

A Node.js command-line interface (CLI) that fetches and displays the recent activity of any GitHub user directly in your terminal.

## Overview

GitHub User Activity is a simple, interactive CLI tool that allows you to query the GitHub API for a user's public activity and view their recent actions in an easy-to-read format. It's perfect for staying updated on what your favorite developers are working on or monitoring team members' contributions.

## Features

**Key Features:**
- **Interactive prompts** - Simply enter a GitHub username and specify how many events you want to see
- **Comprehensive event support** - Handles all major GitHub event types (Push, Pull Request, Issues, Forks, Commits, and more)
- **Timestamps** - Each activity includes the date and time it occurred
- **Batch searching** - Search multiple users without restarting the application
- **Error handling** - Gracefully handles API failures, rate limiting, and invalid usernames
- **Detailed logging** - Optional verbose logging with persistent log files for debugging
- **Secure** - API tokens are masked in logs to prevent accidental exposure

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Gasper-J/GitHubUserActivity.git
   cd GitHubUserActivity
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory with your GitHub API token:
   ```
   API_KEY=your_github_personal_access_token_here
   ```
   
   To generate a token, visit [GitHub Personal Access Tokens](https://github.com/settings/tokens).

## Usage

Run the CLI with:
```bash
node index.js
```

The application will prompt you for:
1. **GitHub Username** - The username of the GitHub user whose activity you want to view
2. **Number of Events** - How many recent events to display (1-50)

Example output:
```
octocat
--------------------------------------------
- Pushed 3 commits to octocat/Hello-World at 3/8/2026, 2:30:45 PM
- Opened a new pull request in octocat/Hello-World at 3/8/2026, 1:15:22 PM
- Starred octocat/awesome-project at 3/7/2026, 9:45:10 AM
```

### Optional Flags

- **`--verbose` or `-v`** - Enable verbose logging to see detailed debug information

## Supported Event Types

The CLI formats and displays the following GitHub event types:
- **PushEvent** - Commit activity with commit counts
- **PullRequestEvent** - PR creation, reviews, and merges
- **IssuesEvent** - Issue creation and updates
- **CreateEvent** - New repositories, branches, or tags
- **DeleteEvent** - Deleted branches or tags
- **ForkEvent** - Repository forks
- **StarEvent** - Starred repositories
- **CommitCommentEvent** - Comments on commits
- **PullRequestReviewEvent** - Code reviews
- **GollumEvent** - Wiki page edits
- And many more...

## Architecture

```
.
├── index.js                 # Main entry point
├── logging.js               # Logging configuration and utilities
├── src/
│   ├── githubApi.js         # GitHub API integration with retry logic
│   ├── userInput.js         # Interactive CLI prompts
│   └── outputFormatter.js   # Event formatting and display logic
├── tests/                   # Jest unit tests
└── package.json             # Dependencies and scripts
```

## Testing

Run the test suite:
```bash
npm test
```

Generate coverage report:
```bash
npm run test:coverage
```

The coverage report is generated in `coverage/lcov-report/index.html`.

## How It Works

1. **User Input** - Collects GitHub username and number of events to fetch
2. **API Call** - Uses GitHub's public events API endpoint: `https://api.github.com/users/<username>/events/public`
3. **Data Processing** - Processes the JSON response and identifies each event type
4. **Formatting** - Converts raw API data into human-readable descriptions with timestamps
5. **Display** - Outputs the formatted activity to the terminal

### Retry Logic

The API client includes built-in retry logic that automatically retries failed requests up to 3 times with exponential backoff, ensuring reliability even with transient network issues.

## Rate Limiting

GitHub's API enforces rate limits. The CLI monitors your remaining requests and will alert you if you've exceeded the limit. Anonymous requests are limited to 60 per hour; authenticated requests allow 5,000 per hour.

## Environment Variables

- `API_KEY` - Your GitHub personal access token (required for higher rate limits and accessing private events for authenticated users)

## Technologies Used

- **Node.js** - Runtime environment
- **Axios** - HTTP client with built-in retry support
- **readline-sync** - Interactive CLI prompts
- **dotenv** - Environment variable management
- **Jest** - Unit testing framework

## Project Status

This project is actively maintained and features all MVP requirements plus timestamps for comprehensive activity tracking.

## Resources

- [GitHub REST API Documentation](https://docs.github.com/en/rest)
- [GitHub User Events API](https://docs.github.com/en/rest/activity/events?apiVersion=2022-11-28)
- [Original Project Inspiration](https://roadmap.sh/projects/github-user-activity)

## License

ISC

---

**Built by Gasper-J**