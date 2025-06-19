import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5000';

export const fetchOverview = async (entryId: number) => {
    const response = await axios.get(`${API_BASE_URL}/api/overview/${entryId}`);
    return response.data;
};

export const fetchTopPlayers = async () => {
    const response = await axios.get(`${API_BASE_URL}/api/top_performing_players`);
    return response.data;
};

export const fetchMiniLeagues = async (entryId: number) => {
    const response = await axios.get(`${API_BASE_URL}/api/minileagues/${entryId}`);
    return response.data;
};

export const fetchGameWeeksData = async (entryId: number) => {
    const response = await axios.get(`${API_BASE_URL}/api/gameweeks/${entryId}`);
    return response.data;
};