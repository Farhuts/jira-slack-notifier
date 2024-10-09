import axios from 'axios';

export const fetchJiraUsers = async () => {
  const url = `${process.env.JIRA_BASE_URL}/rest/api/3/user/assignable/multiProjectSearch`;
  console.log(`Fetching Jira users from URL: ${url}`); // Debugging line

  try {
    const response = await axios.get(url, {
      auth: {
        username: process.env.JIRA_EMAIL,
        password: process.env.JIRA_API_TOKEN,
      },
      params: {
        projectKeys: process.env.JIRA_PROJECT_KEY,
      },
    });
  
      const users = response.data;
  
      // Remove duplicate users based on accountId
      const uniqueUsers = users.filter((user, index, self) =>
        index === self.findIndex((u) => u.accountId === user.accountId)
      );
  
      return uniqueUsers;
    } catch (error) {
      console.error('Error fetching Jira users:', error.response ? error.response.data : error.message);
      return [];
    }
  }