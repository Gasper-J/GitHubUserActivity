const dotenv = require('dotenv');
const { getUsername, getAmount, askSearchAgain } = require('./userInput');
const { axiosWithRetry } = require('./githubApi');
const showOutput = require('./outputFormatter').showOutput;

dotenv.config();

async function getUserEvents() {
  // Prompt the user for the parameters
  const username = getUsername();
  const amountNum = getAmount();

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
    console.clear();
    console.log(showOutput(res));

    // Prompt if the user wants to search another account
    if (askSearchAgain()) {
      await getUserEvents();
    }
  } catch(err) {
    if (err.response && err.response.data) {
      console.log("Failed after retries: ", err.response.data || err.message || err);
    } else {
      console.log("Failed after retries: ", err.message || err);
    }
  }
}

getUserEvents();