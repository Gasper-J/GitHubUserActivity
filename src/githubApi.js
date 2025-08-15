const axios = require('axios');

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

module.exports = { axiosWithRetry };