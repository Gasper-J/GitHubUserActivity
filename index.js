const dotenv = require('dotenv');
const { getUsername, getAmount, askSearchAgain } = require('./src/userInput');
const { axiosWithRetry } = require('./src/githubApi');
const showOutput = require('./src/outputFormatter').showOutput;

dotenv.config();

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
        // 'Authorization': `Bearer ${process.env.API_KEY}`
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
      // console.clear();
      console.log(showOutput(res));

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

getUserEvents();