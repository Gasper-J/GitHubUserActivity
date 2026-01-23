// Lazy-load the compare helper to avoid circular dependency with githubApi
const getPushEventCommitCount = (...args) => require('./githubApi').getPushEventCommitCount(...args);
const logger = require('../logging');

async function showOutput(res) {
  logger.info('Formatting output for user events.');

  const events = res.data;

  if (!events.length) {
    logger.info('No events found to display.');

    return 'No public events found for this user in the last 90 days.';
  }

  let output = `${events[0].actor.display_login}\n--------------------------------------------\n`;

  // Loop through each event formatting as it iterates
  for (const event of events) {
    logger.debug(`Processing event of type: ${event.type}`);

    const eventRepo = event.repo.name;
    const eventTime = new Date(event.created_at);
    const formattedTime = eventTime.toLocaleString();

    switch (event.type) {
      case 'PushEvent': {
        logger.debug('Handling PushEvent type.');

        const pushHead = event.payload.head;
        const pushBefore = event.payload.before;
        let pushNum;
        try {
          logger.debug(`Fetching commit count for PushEvent from ${pushBefore} to ${pushHead} in repo ${eventRepo}`);

          pushNum = await getPushEventCommitCount(pushBefore, pushHead, eventRepo);
          if (pushNum === null || pushNum === undefined) {
            logger.warn('Commit count fetch returned null or undefined.');
            pushNum = 'an unknown number of';
          }
        } catch (err) {
          logger.error(`Failed to get commit count for PushEvent: ${err.message || err}`);

          // If compare fails, fall back to an unknown count
          pushNum = 'an unknown number of';
        }

        logger.debug(`PushEvent commit count determined: ${pushNum}`);

        output += `- Pushed ${pushNum} commits to ${eventRepo} at ${formattedTime}\n`;
        break;
      }
      case 'DeleteEvent': {
        logger.debug('Handling DeleteEvent type.');

        let deletedName = event.payload.ref;
        let deletedType = event.payload.ref_type;

        logger.debug(`DeleteEvent details - Type: ${deletedType}, Name: ${deletedName}`);

        output += `- Deleted ${deletedType} named ${deletedName} from ${eventRepo} at ${formattedTime}\n`;
        break;
      }
      case 'WatchEvent': {
        logger.debug('Handling WatchEvent type.');

        output += `- Starred ${eventRepo} at ${formattedTime}\n`;
        break;
      }
      case 'ForkEvent': {
        logger.debug('Handling ForkEvent type.');

        output += `- Forked ${eventRepo} at ${formattedTime}\n`;
        break;
      }
      case 'ReleaseEvent': {
        logger.debug('Handling ReleaseEvent type.');

        const tag = event.payload.release?.tag_name || 'unknown';

        output += `- Released ${tag} for ${eventRepo} at ${formattedTime}\n`;
        break;
      }
      case 'PublicEvent': {
        logger.debug('Handling PublicEvent type.');

        output += `- Made ${eventRepo} public at ${formattedTime}\n`;
        break;
      }
      case 'GollumEvent': {
        logger.debug('Handling GollumEvent type.');

        const page = event.payload.pages?.[0]?.page_name || 'unknown page';
        output += `- Edited wiki page "${page}" in ${eventRepo} at ${formattedTime}\n`;
        break;
      }
      case 'PullRequestEvent': {
        logger.debug('Handling PullRequestEvent type.');

        const action = event.payload.action;
        const prNumber = event.payload.pull_request?.number;
        const prTitle = event.payload.pull_request?.title || 'unknown title';
        const merged = event.payload.pull_request?.merged;

        let actionText = action.charAt(0).toUpperCase() + action.slice(1);
        if (action === 'closed' && merged) {
          actionText = 'Merged';
        }

        output += `- ${actionText} pull request #${prNumber} "${prTitle}" in ${eventRepo} at ${formattedTime}\n`;
        break;
      }
      default: {
        logger.debug(`Unhandled event type: ${event.type}`);
        output += `- Unhandled event type: ${event.type}\n`;
      }
    }
  }
  logger.info('Completed formatting output for user events.');

  console.clear();
  return output;
}

module.exports = { showOutput };