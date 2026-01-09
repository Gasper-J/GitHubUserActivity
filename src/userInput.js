const readlineSync = require('readline-sync');
const logger = require('../logging');

function getUsername() {
  logger.debug('Prompting user for GitHub username.');

  return readlineSync.question('Enter GitHub Username: ');
}

function getAmount() {
  logger.debug('Prompting user for number of events to display.');

  let amount = readlineSync.question('How many events do you want displayed: ');
  const amountNum = parseInt(amount, 10);
  
  if (isNaN(amountNum) || amountNum < 1 || amountNum > 50) {
    logger.debug('Invalid number entered for events amount, re-prompting user.');

    console.log('Please enter a valid number between 1 and 50.');
    return getAmount();
  }
  logger.debug(`User entered valid number of events to display: ${amountNum}`);

  return amountNum;
}

function askSearchAgain() {
  logger.debug('Prompting user to search for another GitHub user.');
  
  return readlineSync.question('Search another user? [Y]/[N]\n').trim().toUpperCase() === 'Y';
}

module.exports = { getUsername, getAmount, askSearchAgain };