const axios = require('axios');
const logger = require('../logging');
const { getUsername, getAmount, askSearchAgain } = require('./userInput');
const showOutput = require('./outputFormatter').showOutput;

async function axiosWithRetry(url, options, retries = 3, backoff = 500) {
  const safeOptions = {...options, headers: logger.maskSensitiveInfo(options.headers) };

  logger.debug("Making request", { url, options: safeOptions });

  // Define which HTTP status codes are retryable
  const RETRYABLE_STATUS_CODES = new Set([
    429, // Too Many Requests
    500, // Internal Server Error
    502, // Bad Gateway
    503, // Service Unavailable
    504  // Gateway Timeout
  ]);

  let lastError;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      logger.debug(`Attempt ${attempt} for request`, { url });

      return await axios(url, options);
    } catch (err) {
      lastError = err;

      // Retry for network errors only
      if (err.code === 'ECONNABORTED' || err.code === 'ENOTFOUND') {
        if (attempt === retries) throw err; // Throw after last attempt
        logger.warn(`Request failed (attempt ${attempt}), retrying in ${backoff}ms`, { url, error: err.message });

        await new Promise(res => setTimeout(res, backoff));

        continue;
      }

      // Retry for retryable HTTP status codes
      if (err.response) {
        const { status } = err.response;

        if (RETRYABLE_STATUS_CODES.has(status) && attempt < retries) {
          logger.warn(`HTTP ${status} (attempt ${attempt}), retrying in ${backoff}ms`, { url });
          await new Promise(res => setTimeout(res, backoff));
          continue;
        }

        // Non-retryable HTTP error: log and throw
        logger.debug(`Request failed with status ${status} on attempt ${attempt}`, { 
          url, 
          data: err.response.data 
        });

        throw err;
      }

      // Other unknown errors: log and throw
      logger.debug(`Request failed with unknown error`, { 
        url, 
        error: err.message 
      });

      throw err;
    }
  }
  
  // All retries exhausted
  logger.error(`All ${retries} attempts failed`, { url, lastError: lastError.message });

  throw lastError;
}

async function getUserEvents(username, amountNum) {
  logger.info('Starting GitHub user events retrieval process.');

  let continueSearch = true;

  while (continueSearch) {
    logger.info('Prompting user for GitHub username and event amount.');

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
      params: { per_page: amountNum },
      timeout: 5000
    };

    try {
      logger.debug('Fetching user events', {username, amount: amountNum });

      const res = await axiosWithRetry(url, options);

      const remaining = res.headers['x-ratelimit-remaining'];

      if (remaining && remaining <= 0) {
        logger.warn('Rate limit exceeded', { username });

        console.log('GitHub API rate limit exceeded. Please wait before retrying.');
        return;
      }

      // Display results
      logger.info('Formatting and displaying output', { username });

      const output = await showOutput(res);
      console.clear();
      console.log(output);

      // Prompt if the user wants to search another account
      continueSearch = askSearchAgain();
      
    } catch(err) {
      logger.error('API request failed', { username, error: err.response?.data || err.message, stack: err.stack });
      console.log("Request failed: ", err.response?.data || err.message);
      logger.info('Ending GitHub user events retrieval process due to error.');
      
      continueSearch = false; // Stop the loop on error
    }
    logger.info('Completed one iteration of retrieval process.', { username });

  }
  logger.info('Finished GitHub user events retrieval process.');

}

async function getPushEventCommitCount(pushBefore, pushHead, repoName) {
  logger.debug(`Fetching commit count for push event`, { repoName, pushBefore, pushHead });

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
    logger.debug('Making API request', { url });

    const res = await axiosWithRetry(url, options);
    const remaining = res.headers && res.headers['x-ratelimit-remaining'];
    
    if (remaining && remaining <= 0) {
      logger.warn('Rate limit exceeded for compare API.', { repoName });

      console.log('GitHub API rate limit exceeded. Please wait before retrying.');
      return null;
    }

    // Prefer total_commits if available, otherwise fall back to commits array length
    const totalCommits = res.data?.total_commits ?? res.data?.commits?.length ?? null;

    return totalCommits;
    
  } catch(err) {
    logger.error('Compare API request failed', {repoName, error: err.response?.data || err.message, stack: err.stack });
    console.log('Failed fetching compare: ', err.response?.data || err.message);

    return null;
  }
}

module.exports = { axiosWithRetry, getUserEvents, getPushEventCommitCount };