# GitHubUserActivity — Tests & Coverage

This repository uses Jest for unit tests. This README shows how to run tests, collect coverage, inspect uncovered lines, and strategies to add tests to increase coverage.

## Run tests

From the project root (PowerShell):

```powershell
# Run all tests once
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch
```

## Run tests with coverage

The project has a script that generates coverage reports (text summary + HTML lcov report):

```powershell
# Run Jest with coverage
npm run test:coverage
```

After running the coverage script you'll see a terminal text summary and a folder `coverage/lcov-report` with an HTML report. To open the HTML report from PowerShell:

```powershell
# Open the coverage HTML report in the default browser
Invoke-Item .\coverage\lcov-report\index.html
```

## Interpreting the coverage report

- Terminal output shows per-file coverage percentages: Statements, Branches, Functions, Lines.
- The HTML report highlights uncovered lines in red and shows which branches are not covered.
- Look at the `Lines` and `Branches` columns — branches are often responsible for missed coverage (if/else, early returns, catch blocks).

## Finding uncovered code and writing tests for it

1. Run `npm run test:coverage` and open the HTML report.
2. For each file with low coverage, open the file and inspect the uncovered line numbers shown by the report.
3. Common patterns to add tests for:
   - Error paths (throw/catch). Example: mock `axios` to throw different error shapes so `catch` branches are exercised.
   - Edge inputs (empty arrays, null/undefined, 0, empty strings).
   - Alternate branches in `if`/`else` chains and switch/case fallthroughs.
   - Time-dependent logic: inject or mock `Date` or timers.
   - External dependencies: mock them (e.g., `jest.mock('axios')`) to control responses.

Example: covering an error path in `src/githubApi.js`

```javascript
// tests/githubApi.error.test.js
jest.mock('axios');
const axios = require('axios');
const { axiosWithRetry } = require('../src/githubApi');

test('throws on 4xx without retry', async () => {
  axios.mockImplementationOnce(() => Promise.reject({ response: { status: 404 } }));
  await expect(axiosWithRetry('url', {})).rejects.toEqual({ response: { status: 404 } });
});
```

This example mocks `axios` to reject with a response shape and asserts that the function throws as expected.

## Coverage-driven development workflow

- Run `npm run test:coverage`.
- Open coverage report and list uncovered files/lines.
- Create small focused tests to cover each uncovered branch (one assertion per branch is fine).
- Re-run coverage to verify the increase.
- Repeat until you meet your target threshold.

Optional: enforce thresholds

If you want to fail CI when coverage drops below a threshold, add a `coverageThreshold` entry to the Jest config (in `package.json` or `jest.config.js`). Example in `package.json`:

```json
"jest": {
  "collectCoverageFrom": ["src/**/*.js"],
  "coverageDirectory": "coverage",
  "coverageReporters": ["text","lcov"],
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    }
  }
}
```

With thresholds in place, `npm test` (or `npm run test:coverage`) will fail if coverage falls below the configured percentages.

## Tips for writing tests to cover tricky branches

- Use `jest.spyOn` and `jest.mock` to control modules and inspect calls.
- For functions that exit early on invalid input, write tests that pass invalid inputs and assert the function returns or throws as documented.
- For async functions, prefer `await expect(fn()).rejects.toThrow()` or `resolves` matchers.
- Use parameterized tests with `test.each` to cover several inputs in one test block.

## Example commands (PowerShell)

```powershell
# Install dependencies (if not already installed)
npm install

# Run tests once
npm test

# Generate coverage
npm run test:coverage

# Open coverage report
Invoke-Item .\coverage\lcov-report\index.html
```
