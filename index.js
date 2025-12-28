const dotenv = require('dotenv');
const { axiosWithRetry, getUserEvents, getPushEventCommitCount } = require('./src/githubApi');

dotenv.config();

getUserEvents();