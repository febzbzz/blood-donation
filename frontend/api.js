// api.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const fetchDonors = async () => {
  try {
    const response = await axios.get(`${API_URL}/donors`);
    return response.data;
  } catch (error) {
    console.error('Error fetching donors:', error);
    throw error;
  }
};

export const registerDonor = async (donorData) => {
  try {
    const response = await axios.post(`${API_URL}/donors/register`, donorData);
    return response.data;
  } catch (error) {
    console.error('Error registering donor:', error);
    throw error;
  }
};