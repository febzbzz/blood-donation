// src/api/user.js
import { API_URL } from './config';
import { getToken } from '../utils/auth';

export const getUserProfile = async () => {
  try {
    const response = await fetch(`${API_URL}/users/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return await response.json();
  } catch (error) {
    console.error('Get profile error:', error);
    throw error;
  }
};