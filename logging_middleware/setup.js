const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://4.224.186.213/evaluation-service';


const SKIP_REGISTRATION = false;
const EXISTING_CLIENT_ID = '';      
const EXISTING_CLIENT_SECRET = '';  
// ─────────────────────────────────────────────────────────────────────────────

async function register(data) {
    const response = await axios.post(`${BASE_URL}/register`, data);
    return response.data;
}

async function getAuthToken(data) {
    const response = await axios.post(`${BASE_URL}/auth`, data);
    return response.data;
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
        mobileNo: '8467941850',
        githubUsername: 'Santoshpatel112',
        accessCode: 'cXuqht'
    };

    try {
        let clientID, clientSecret;

        if (SKIP_REGISTRATION && EXISTING_CLIENT_ID && EXISTING_CLIENT_SECRET) {
            clientID = EXISTING_CLIENT_ID;
            clientSecret = EXISTING_CLIENT_SECRET;
            console.log('--- Using existing credentials (skipping registration) ---');
        } else {
            console.log('--- Attempting Registration ---');
            try {
                const regResult = await register(userData);
                console.log('REGISTRATION SUCCESSFUL!');
                console.log('Your ClientID:', regResult.clientID);
                console.log('Your ClientSecret:', regResult.clientSecret);
                clientID = regResult.clientID;
                clientSecret = regResult.clientSecret;
            } catch (err) {
                const msg = err.response
                    ? JSON.stringify(err.response.data)
                    : err.message;
                console.error('Registration failed:', msg);
                console.log('\n>>> If already registered, paste your clientID and clientSecret');
                console.log('>>> into EXISTING_CLIENT_ID / EXISTING_CLIENT_SECRET above,');
                console.log('>>> set SKIP_REGISTRATION = true, then run: node setup.js\n');
                return;
            }
        }

        console.log('--- Attempting Authentication ---');
        const authResponse = await getAuthToken({
            ...userData,
            clientID,
            clientSecret
        });

        const token = authResponse.access_token;
        console.log('AUTHENTICATION SUCCESSFUL!');
        console.log('Token:', token.substring(0, 40) + '...');

        const envPaths = [
            path.join(__dirname, '.env'),
            path.join(__dirname, '..', 'vehicle_maintenance_scheduler', '.env'),
            path.join(__dirname, '..', 'notification_app_be', '.env')
        ];

        envPaths.forEach(p => upsertEnvValue(p, 'LOG_AUTH_TOKEN', token));
        console.log('SUCCESS: Token saved to all .env files');

    } catch (error) {
        const msg = error.response
            ? JSON.stringify(error.response.data)
            : error.message;
        console.error('ERROR:', msg);
    }
}

setup();
