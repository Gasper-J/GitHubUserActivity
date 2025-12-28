const axios = require('axios');
const { getUsername, getAmount, askSearchAgain } = require('./userInput');
const showOutput = require('./outputFormatter').showOutput;

async function axiosWithRetry(url, options, retries = 3, backoff = 500) {
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await axios(url, options);
    } catch (err) {
      lastError = err;
      // Only retry for network errors
      if (
        err.code === 'ECONNABORTED' ||
        err.code === 'ENOTFOUND'
      ) {
        if (attempt === retries) throw err; // Throw after last attempt
        continue;
      }
      // Do not retry on 4xx or 5xx errors
      if (err.response && err.response.status >= 400 && err.response.status < 600) {
        throw err;
      }
      // For any other error, throw immediately
      throw err;
    }
  }
  // If all retries failed, throw the last error
  throw lastError;
}

async function getUserEvents() {
  let continueSearch = true;

  while (continueSearch) {
    // Prompt the user for the parameters
    const username = getUsername();
    const amountNum = getAmount();
    continueSearch = false;

    // Set request variables
    const url = `https://api.github.com/users/${username}/events/public`;
    const options = {
      method: 'get',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'GasperJ-GitHub-User-Activity',
        'Authorization': `Bearer ${process.env.API_KEY}`
      },
      params: {
        per_page: amountNum,
      },
      timeout: 5000,
    };

    try {
      const res = await axiosWithRetry(url, options);
      const remaining = res.headers['x-ratelimit-remaining'];
      
      if (remaining && remaining <= 0) {
        console.log('GitHub API rate limit exceeded. Please wait before retrying.');
        return;
      }

      // Display results
      const output = await showOutput(res);
      console.clear();
      console.log(output);

      // Prompt if the user wants to search another account
      continueSearch = askSearchAgain();
      
    } catch(err) {
      if (err.response && err.response.data) {
        console.log("Failed after retries: ", err.response.data);
      } else {
        console.log("Failed after retries: ", err.message || err);
      }
      continueSearch = false; // Stop the loop on error
    }
  }
}

async function getPushEventCommitCount(pushBefore, pushHead, repoName) {
  // Validate repoName format
  const [owner, repo] = (repoName || '').split('/');
  if (!owner || !repo) return null;

  const url = `https://api.github.com/repos/${owner}/${repo}/compare/${pushBefore}...${pushHead}`;
  const options = {
    method: 'get',
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'GasperJ-GitHub-User-Activity',
      'Authorization': `Bearer ${process.env.API_KEY}`
    },
    timeout: 5000,
  };

  try {
    const res = await axiosWithRetry(url, options);
    const remaining = res.headers && res.headers['x-ratelimit-remaining'];
    
    if (remaining && remaining <= 0) {
      console.log('GitHub API rate limit exceeded. Please wait before retrying.');
      return null;
    }

    // Prefer total_commits if available, otherwise fall back to commits array length
    const totalCommits = (res.data && (typeof res.data.total_commits === 'number'
      ? res.data.total_commits
      : (Array.isArray(res.data.commits) ? res.data.commits.length : null)));

    return totalCommits ?? null;
    
  } catch(err) {
    if (err.response && err.response.data) {
      console.log("Failed fetching compare: ", err.response.data);
    } else {
      console.log("Failed fetching compare: ", err.message || err);
    }
    return null;
  }
}

module.exports = { axiosWithRetry, getUserEvents, getPushEventCommitCount };