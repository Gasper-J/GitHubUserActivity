const axios = require('axios');
const dotenv = require('dotenv');
const readlineSync = require('readline-sync');

dotenv.config();

function getUserEvents() {
    const username = readlineSync.question('Enter GitHub Username: ');
    const amount = readlineSync.question('How many events do you want displayed: ');
    axios({
      method: 'get',
      url: `https://api.github.com/users/${username}/events/public`,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'GasperJ-GitHub-User-Activity',
        'Authorization': `Bearer ${process.env.API_KEY}`
      },
      params: {
        per_page: `${amount}`
      }
    })
      .then(res => console.log(res.data))
      .catch(err => console.log(err));
  }

  getUserEvents();