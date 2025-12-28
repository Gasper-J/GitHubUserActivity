// Lazy-load the compare helper to avoid circular dependency with githubApi
const getPushEventCommitCount = (...args) => require('./githubApi').getPushEventCommitCount(...args);

async function showOutput(res) {
  const events = res.data;

  console.log(res.data);

  if (!events.length) {
    return 'No events found for this user.';
  }

  let output = `${events[0].actor.display_login}\n--------------------------------------------\n`;

  // Loop through each event formatting as it iterates
  for (const event of events) {
    const eventRepo = event.repo.name;
    const eventTime = new Date(event.created_at);
    const formattedTime = eventTime.toLocaleString();

    switch (event.type) {
      case 'PushEvent': {
        const pushHead = event.payload.head;
        const pushBefore = event.payload.before;
        let pushNum;
        try {
          pushNum = await getPushEventCommitCount(pushBefore, pushHead, eventRepo);
          if (pushNum === null || pushNum === undefined) {
            pushNum = 'an unknown number of';
          }
        } catch (err) {
          // If compare fails, fall back to an unknown count
          pushNum = 'an unknown number of';
        }

        output += `- Pushed ${pushNum} commits to ${eventRepo} at ${formattedTime}\n`;
        break;
      }
      case 'DeleteEvent': {
        let deletedName = event.payload.ref;
        let deletedType = event.payload.ref_type;

        output += `- Deleted ${deletedType} named ${deletedName} from ${eventRepo} at ${formattedTime}\n`;
        break;
      }
    }
  }

  return output;
}

module.exports = { showOutput };