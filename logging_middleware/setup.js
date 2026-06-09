const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://4.224.186.213/evaluation-service';

async function register(data) {
    try {
        const response = await axios.post(`${BASE_URL}/register`, data);
        console.log('Registration Successful:', response.data);
        return response.data;
    } catch (error) {
        console.error('Registration Failed:', error.response ? error.response.data : error.message);
        throw error;
    }
}

async function getAuthToken(data) {
    try {
        const response = await axios.post(`${BASE_URL}/auth`, data);
        console.log('Authentication Successful:', response.data);
        return response.data;
    } catch (error) {
        console.error('Authentication Failed:', error.response ? error.response.data : error.message);
        throw error;
    }
}

async function setup() {
    // Example data - User should replace these with their own details
    const userData = {
        email: 'santosh.patel@example.com', // Replace with actual email
        name: 'Santosh Patel',
        rollNo: '2300321540',
        githubUsername: 'Santoshpatel112',
        accessCode: 'xGksNC' // Replace with actual access code from email
    };

    try {
        // Step 1: Register (Only once)
        // const registrationInfo = await register(userData);
        
        // Step 2: Get Token (Requires clientID and clientSecret from registration)
        // If registration was already done, use the clientID and clientSecret
        const authData = {
            ...userData,
            clientID: 'd3cb0b93-6a27-44a5-8d59-8b1befa816da', // Replace with your clientID
            clientSecret: 'TVJaaaMBSekcRXwM' // Replace with your clientSecret
        };

        const authResponse = await getAuthToken(authData);
        const token = authResponse.access_token;

        // Step 3: Save token to .env file
        const envContent = `LOG_AUTH_TOKEN=${token}\n`;
        fs.writeFileSync(path.join(__dirname, '.env'), envContent);
        console.log('.env file updated with LOG_AUTH_TOKEN');

    } catch (error) {
        console.error('Setup failed');
    }
}

if (require.main === module) {
    setup();
}

module.exports = { register, getAuthToken };
