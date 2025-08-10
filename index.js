const axios = require('axios');
const dotenv = require('dotenv');
const readlineSync = require('readline-sync');

dotenv.config();

async function getUserEvents() {
  // Prompt the user for the parameters
  const username = readlineSync.question('Enter GitHub Username: ');
  let amount = readlineSync.question('How many events do you want displayed: ');
  const amountNum = parseInt(amount, 10);
  
  if (isNaN(amountNum) || amountNum < 0 || amountNum >= 50) {
    console.log('Please enter a valid number between 1 and 50.');
    return getUserEvents();
  }
  
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
    if (readlineSync.question('Search another user? [Y]/[N]\n').toUpperCase() == 'Y') {
      await getUserEvents();
    }
  } catch(err) {
    console.log("Failed after retries: ", err.message);
  }
}

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

function showOutput(res) {
  const events = res.data;

  if (!events.length) {
    return 'No events found for this user.';
  }

  let output = `${events[0].actor.display_login}\n--------------------------------------------\n`;

  // Loop through each event formating as it iterates
  events.forEach(event => {
    const eventRepo = event.repo.name;
    const eventTime = new Date(event.created_at);
    const formattedTime = eventTime.toLocaleString();

    switch (event.type) {
      case 'PushEvent':
        let pushNum = event.payload.commits.length;

        output += `- Pushed ${pushNum} commits to ${eventRepo} at ${formattedTime}\n`;
        break;
      case 'DeleteEvent':
        let deletedName = event.payload.ref;
        let deletedType = event.payload.ref_type;

        output += `- Deleted ${deletedType} named ${deletedName} from ${eventRepo} at ${formattedTime}\n`;
        break;
    }
  });

  return output;
}

getUserEvents();