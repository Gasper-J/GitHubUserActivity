const readlineSync = require('readline-sync');

function getUsername() {
  return readlineSync.question('Enter GitHub Username: ');
}

function getAmount() {
  let amount = readlineSync.question('How many events do you want displayed: ');
  const amountNum = parseInt(amount, 10);
  
  if (isNaN(amountNum) || amountNum < 0 || amountNum >= 50) {
    console.log('Please enter a valid number between 1 and 50.');
    return getAmount();
  }
  
  return amountNum;
}

function askSearchAgain() {
  return readlineSync.question('Search another user? [Y]/[N]\n').toUpperCase() === 'Y';
}

module.exports = { getUsername, getAmount, askSearchAgain };