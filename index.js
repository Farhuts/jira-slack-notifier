// index.js
import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import cron from 'node-cron';
import pLimit from 'p-limit';
import axiosRetry from 'axios-retry';
import { mapJiraToSlack } from './utils/mapJiraToSlack.js'; 
import { fetchJiraIssuesForUser } from './utils/fetchJiraIssuesForUser.js'; 
import { fetchJiraUsers } from './utils/fetchJiraUsers.js'; 
import { sendSlackMessage } from './utils/sendSlackMessage.js';
import { composeMessage } from './utils/composeMessage.js';
import { sendTestNotification } from './utils/sendTestNotification.js';

axiosRetry(axios, {
  retries: 3,
  retryDelay: (retryCount) => {
    return axiosRetry.exponentialDelay(retryCount);
  },
  retryCondition: (error) => {
    return error.response && error.response.status === 429;
  },
});

const sendDailyNotifications = async () => {
  // Step 1: Fetch Jira users
  const jiraUsers = await fetchJiraUsers();
  console.log(`Fetched ${jiraUsers.length} users from Jira.`);

  if (jiraUsers.length === 0) {
    console.log('No users found to notify.');
    return;
  }

  // Step 2: Map Jira users to Slack IDs
  const slackUsers = await mapJiraToSlack(jiraUsers);
  console.log(`Mapped ${slackUsers.length} Jira users to Slack.`);

  if (slackUsers.length === 0) {
    console.log('No Slack users mapped. Exiting.');
    return;
  }

  const limit = pLimit(5);

  const sendNotifications = slackUsers.map(user => limit(async () => {
    const issues = await fetchJiraIssuesForUser(user.accountId);
    const message = composeMessage(user, issues);
    await sendSlackMessage(user.slackId, message);
  }));

  await Promise.all(sendNotifications);

  console.log('--- Daily Notifications Completed ---');
}

// Schedule the task based on the cron expression
cron.schedule(process.env.SCHEDULE_CRON, () => {
  sendDailyNotifications();
});

// sendDailyNotifications();
// sendTestNotification('email@test.com', process.env.SLACK_BOT_TOKEN)
//   .then(() => {
//     console.log('Test meeting notification process completed.');
//   })
//   .catch((error) => {
//     console.error('Error during test meeting notification:', error);
//   });
