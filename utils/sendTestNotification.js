import axios from 'axios';
import { mapJiraToSlack } from './mapJiraToSlack.js';
import { fetchJiraIssuesForUser } from './fetchJiraIssuesForUser.js';
import { composeMessage } from './composeMessage.js';
import { sendSlackMessage } from './sendSlackMessage.js';

/**
 * Sends meeting notifications to a specific user based on their Jira issues' Parent fields.
 *
 * @param {string} email - The hardcoded email address of the user to notify.
 * @param {string} slackBotToken - Slack Bot Token for authentication.
 * @returns {Promise<void>}
 */
export const sendTestNotification = async (email, slackBotToken) => {
  try {
    // Step 1: Fetch all Jira users to find the user with the specified email
    const allJiraUsersResponse = await axios.get(`${process.env.JIRA_BASE_URL}/rest/api/3/user/search`, {
      auth: {
        username: process.env.JIRA_EMAIL,
        password: process.env.JIRA_API_TOKEN,
      },
      params: {
        query: email,
      },
    });

    const matchingUsers = allJiraUsersResponse.data.filter(user => user.emailAddress.toLowerCase() === email.toLowerCase());

    if (matchingUsers.length === 0) {
      console.error(`No Jira user found with email: ${email}`);
      return;
    }

    const jiraUser = matchingUsers[0];

    // Step 2: Map the Jira user to Slack ID
    const mappedUsers = await mapJiraToSlack([jiraUser], slackBotToken);

    if (mappedUsers.length === 0) {
      console.error(`No Slack user mapped for Jira user with email: ${email}`);
      return;
    }

    const slackUser = mappedUsers[0];

    // Step 3: Fetch Jira issues for the user
    const issues = await fetchJiraIssuesForUser(jiraUser.accountId);

    // Step 4: Compose the meeting notification message
    const message = composeMessage(jiraUser, issues);

    // Step 5: Send the Slack message
    await sendSlackMessage(slackUser.slackId, message);

    console.log(`Meeting notification successfully sent to Slack user: ${slackUser.displayName}`);
  } catch (error) {
    console.error(`Error sending meeting notification for email ${email}:`, error.response ? error.response.data : error.message);
  }
};