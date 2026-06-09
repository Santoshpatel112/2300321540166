const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://4.224.186.213/evaluation-service';

async function register(data) {
    try {
        const response = await axios.post(`${BASE_URL}/register`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
}

async function getAuthToken(data) {
    try {
        const response = await axios.post(`${BASE_URL}/auth`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
}

function upsertEnvValue(filePath, key, value) {
    const nextLine = `${key}=${value}`;
    let content = '';
    if (fs.existsSync(filePath)) {
        content = fs.readFileSync(filePath, 'utf8');
    }
    const lines = content.split(/\r?\n/).filter(Boolean).filter((line) => !line.startsWith(`${key}=`));
    lines.push(nextLine);
    fs.writeFileSync(filePath, `${lines.join('\n')}\n`);
}

async function setup() {
    const userData = {
        email: 'santosh.23b1541113@abes.ac.in', 
        name: 'Santosh Patel',
        rollNo: '2300321540166', 
        githubUsername: 'Santoshpatel112',
        accessCode: 'cXuqht' 
    };

    try {
        let clientID, clientSecret;

        try {
            const regResult = await register(userData);
            console.log('REGISTRATION SUCCESSFUL!');
            console.log('ClientID:', regResult.clientID);
            console.log('ClientSecret:', regResult.clientSecret);
            clientID = regResult.clientID;
            clientSecret = regResult.clientSecret;
        } catch (err) {
            console.log('Registration Failed/Already Done:', err.response ? err.response.data.message : err.message);
            console.log('Using IDs from code...');
            // PASTE YOUR REAL IDs BELOW IF REGISTRATION ALREADY HAPPENED
            clientID = 'd3cb0b93-6a27-44a5-8d59-8b1befa816da'; 
            clientSecret = 'TVJaaaMBSekcRXwM'; 
        }

        
        const authResponse = await getAuthToken({
            ...userData,
            clientID,
            clientSecret
        });

        const token = authResponse.access_token;
        console.log('AUTHENTICATION SUCCESSFUL!');

        const paths = [
            path.join(__dirname, '.env'),
            path.join(__dirname, '..', 'vehicle_maintenance_scheduler', '.env'),
            path.join(__dirname, '..', 'notification_app_be', '.env')
        ];

        paths.forEach(p => upsertEnvValue(p, 'LOG_AUTH_TOKEN', token));
        console.log('SUCCESS: Token saved to all .env files');

    } catch (error) {
        console.error('ERROR:', error.response ? error.response.data.message : error.message);
    }
}

setup();
