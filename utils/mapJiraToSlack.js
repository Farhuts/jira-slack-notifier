import axios from 'axios';

 // Function to map Jira users to Slack user IDs
 export const mapJiraToSlack = async (users) => {
  const mappedUsers = [];

  for (const user of users) {
    if (!user.emailAddress) {
      console.warn(`No email for Jira user: ${user.displayName} (${user.accountId})`);
      continue;
    }

    try {
      const response = await axios.get('https://slack.com/api/users.lookupByEmail', {
        params: { email: user.emailAddress },
        headers: {
          'Authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`,
        },
      });

      if (response.data.ok) {
        mappedUsers.push({
          ...user,
          slackId: response.data.user.id,
        });
      } else {
        console.warn(`Slack user not found for email: ${user.emailAddress}`);
      }
    } catch (error) {
      console.error(`Error mapping Slack user for ${user.emailAddress}:`, error.response ? error.response.data : error.message);
    }
  }

  return mappedUsers;
}