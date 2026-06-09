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
        email: 'santosh.23b1540.dev@abes.ac.in', 
        name: 'Santosh Patel',
        rollNo: '2300321540', 
        githubUsername: 'Santoshpatel112',
        accessCode: 'cXuqht' 
    };

    try {
        console.log('--- Attempting Registration ---');
        let clientID, clientSecret;

        try {
            const regResult = await register(userData);
            console.log('REGISTRATION SUCCESSFUL!');
            console.log('Your ClientID:', regResult.clientID);
            console.log('Your ClientSecret:', regResult.clientSecret);
            clientID = regResult.clientID;
            clientSecret = regResult.clientSecret;
        } catch (err) {
            console.error('Registration failed:', err.response ? err.response.data.message : err.message);
            return;
        }

        console.log('--- Attempting Authentication ---');
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
