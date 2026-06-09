const axios = require('axios');
require('dotenv').config();

const LOG_API_URL = 'http://4.224.186.213/evaluation-service/logs';

/**
 * Reusable logging function
 * @param {string} stack 
 * @param {string} level 
 * @param {string} pkg 
 * @param {string} message 
 */
async function log(stack, level, pkg, message) {
    const tokens = process.env.LOG_AUTH_TOKEN;

    if (!tokens) {
        console.warn('Logging Middleware: No auth token found in LOG_AUTH_TOKEN environment variable.');
        return;
    }

    const payload = {
        stack,
        level,
        package: pkg,
        message
    };

    try {
        const response = await axios.post(LOG_API_URL, payload, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.status === 200) {
           
            return response.data;
        }
    } catch (error) {
        console.error('Logging Middleware Error:', error.response ? error.response.data : error.message);
    }
}

module.exports = { log };
