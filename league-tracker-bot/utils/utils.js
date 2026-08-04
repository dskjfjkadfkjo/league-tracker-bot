const axios = require('axios');

const BASE_URL = 'https://ps99.biggamesapi.io/v1';

async function fetchAllLeagues(page = 1, pageSize = 25) {
    try {
        const response = await axios.get(`${BASE_URL}/leagues`, {
            params: {
                page: page,
                pageSize: pageSize,
                sort: 'Points'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching all leagues:', error);
        return null;
    }
}

async function fetchLeagueData(leagueId) {
    try {
        const response = await axios.get(`${BASE_URL}/leagues/${leagueId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching league ${leagueId}:`, error);
        return null;
    }
}

async function fetchLeagueRank(leagueId, playerId) {
    try {
        const response = await axios.get(`${BASE_URL}/leagues/${leagueId}/rank/${playerId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching rank for ${playerId}:`, error);
        return null;
    }
}

module.exports = {
    fetchAllLeagues,
    fetchLeagueData,
    fetchLeagueRank
};