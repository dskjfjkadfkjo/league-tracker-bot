const axios = require('axios');

const BASE_URL = 'https://ps99.biggamesapi.io/v1';

async function fetchLeagueData(leagueId) {
    try {
        const response = await axios.get(`${BASE_URL}/leagues/${leagueId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching league ${leagueId}:`, error);
        return null;
    }
}

module.exports = {
    fetchLeagueData
};
