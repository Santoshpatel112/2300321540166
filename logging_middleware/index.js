const axios = require("axios");
require("dotenv").config({ path: require('path').resolve(__dirname, '.env') });
require("dotenv").config({ path: require('path').resolve(__dirname, '../vehicle_maintenance_scheduler/.env') });

const LOG_API_URL =
  process.env.LOG_API_URL || "http://4.224.186.213/evaluation-service/logs";

async function log(stack, level, pkg, message) {
  const token = process.env.LOG_AUTH_TOKEN || process.env.log_auth_token;

  if (!token) {
    console.warn("Logging Middleware: LOG_AUTH_TOKEN is missing.");
    return null;
  }

  // API enforces a 48-character limit on message
  const safeMessage = String(message).substring(0, 48);

  try {
    const response = await axios.post(
      LOG_API_URL,
      {
        stack,
        level,
        package: pkg,
        message: safeMessage,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Logging Middleware Error:",
      error.response ? error.response.data : error.message
    );
    return null;
  }
}

module.exports = {log};
