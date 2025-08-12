const axios = require('axios');

async function axiosWithRetry(url, options, retries = 3, backoff = 500) {
  try {
    return await axios(url, options);
  } catch (error) {
    if (
      retries > 0 && 
      (error.code === 'ECONNABORTED' ||
         error.code === 'ENOTFOUND' ||
         error.response?.status >= 500)
    ) {
      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, backoff));
      return axiosWithRetry(url, options, retries - 1, backoff * 2);
    }
    // If no retries left or error is not retryable, throw error
    throw error;
  }
}

module.exports = { axiosWithRetry };