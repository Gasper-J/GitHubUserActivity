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

## Prerequisites

- **Node.js** (v14.0 or higher)
- **npm** (comes with Node.js)
- A GitHub Personal Access Token (optional but recommended)

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

## Getting Help

If you encounter issues or have questions:
- Check the [existing issues](https://github.com/Gasper-J/GitHubUserActivity/issues)
- Open a new issue for bugs or feature requests

## Technologies Used

- **Node.js** - Runtime environment
- **Axios** - HTTP client with built-in retry support
- **readline-sync** - Interactive CLI prompts
- **dotenv** - Environment variable management
- **Jest** - Unit testing framework

## Resources

- [GitHub REST API Documentation](https://docs.github.com/en/rest)
- [GitHub User Events API](https://docs.github.com/en/rest/activity/events?apiVersion=2022-11-28)
- [Original Project Inspiration](https://roadmap.sh/projects/github-user-activity)

## License

Distributed under the MIT License. See LICENSE.txt for more information.

**Built by Gasper-J**