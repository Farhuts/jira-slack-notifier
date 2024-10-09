import axios from 'axios';

/**
 * Sends a Slack message to a specific user.
 *
 * @param {string} slackId - The Slack user ID.
 * @param {string} message - The message text.
 * @returns {Promise<void>}
 */

export const sendSlackMessage = async(slackId, message) => {
    try {
      const response = await axios.post('https://slack.com/api/chat.postMessage', {
        channel: slackId,
        text: message,
        // blocks: [], // use Block Kit for rich formatting
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`,
        },
      });
  
      if (!response.data.ok) {
        console.error(`Failed to send message to Slack ID ${slackId}:`, response.data.error);
      } else {
        console.log(`Message sent to Slack ID ${slackId}`);
      }
    } catch (error) {
      console.error(`Error sending Slack message to ${slackId}:`, error.response ? error.response.data : error.message);
    }
  }
  