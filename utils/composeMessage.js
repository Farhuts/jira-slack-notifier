const parentToMeetingMap = {
    'Marketing': 'Marketing',
    'Platform Build': 'Platform Build'
  };

/**
 * Composes a Slack message based on the user's Jira issues' Parent fields.
 *
 * @param {Object} user - The Jira user object.
 * @param {Array} issues - Array of Jira issue objects.
 * @returns {string} - The composed message.
 */
export const composeMessage = (user, issues) => {
  const meetings = new Set();

  issues.forEach(issue => {
    if (issue.fields.parent && issue.fields.parent.key) {
      const parentKey = issue.fields.parent.fields.summary;
      const meeting = parentToMeetingMap[parentKey];
      if (meeting) {
        meetings.add(meeting);
      }
    }
  });

  if (meetings.size === 0) {
    return `Good morning, *${user.displayName}*!\n• You have no meetings scheduled for today. Great job!`;
  }

  const meetingList = Array.from(meetings).map(m => `'${m}'`).join(', ');
  const message = `Good morning, *${user.displayName}*!\nYou are expected to attend the following meeting(s) today: ${meetingList}.`;

  return message;
}