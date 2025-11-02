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

module.exports = { showOutput };