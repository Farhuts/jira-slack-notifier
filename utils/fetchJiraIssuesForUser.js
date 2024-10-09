import axios from 'axios';

/**
 * Fetches pending Jira issues for a specific user.
 *
 * @param {string} userAccountId - The Jira account ID of the user.
 * @returns {Promise<Array>} - Array of Jira issue objects.
 */
export const fetchJiraIssuesForUser = async (userAccountId) => {
    try {
      const jql = `assignee = ${userAccountId} AND resolution = Unresolved`;
      const response = await axios.get(`${process.env.JIRA_BASE_URL}/rest/api/3/search`, {
        auth: {
          username: process.env.JIRA_EMAIL,
          password: process.env.JIRA_API_TOKEN,
        },
        params: {
          jql,
          fields: 'summary,status,parent', // Include 'parent' field
          maxResults: 50, // Adjust as needed
        },
      });
  
      return response.data.issues;
    } catch (error) {
      console.error(`Error fetching issues for user ${userAccountId}:`, error.response ? error.response.data : error.message);
      return [];
    }
}