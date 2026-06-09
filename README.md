# AffordMed Campus Hiring Evaluation - Backend Track

This repository contains the completed assessment for the AffordMed Campus Hiring Evaluation. The project implements a centralized logging middleware, a vehicle maintenance scheduler, and a notification system design.

## Repository Structure

- **[logging_middleware](./logging_middleware)**: A reusable package for centralized logging across the stack.
- **[vehicle_maintenance_scheduler](./vehicle_maintenance_scheduler)**: A backend service for managing vehicle maintenance tasks.
- **[notification_app_be](./notification_app_be)**: A backend service for handling multi-channel notifications.
- **[notification_system_design.md](./notification_system_design.md)**: Detailed architectural design for a scalable notification system.

## Setup Instructions

### 1. Centralized Logging
1. Navigate to `logging_middleware`.
2. Install dependencies: `npm install`.
3. Update `setup.js` with your credentials.
4. Run `node setup.js` to register and obtain your `LOG_AUTH_TOKEN`.

### 2. Vehicle Maintenance Scheduler
1. Navigate to `vehicle_maintenance_scheduler`.
2. Install dependencies: `npm install`.
3. Run the service: `node index.js`.
4. Access at: `http://localhost:3001`.

### 3. Notification App Backend
1. Navigate to `notification_app_be`.
2. Install dependencies: `npm install`.
3. Run the service: `node index.js`.
4. Access at: `http://localhost:3002`.

## Technologies Used
- **Node.js**: Runtime environment.
- **Express**: Web framework for building APIs.
- **Axios**: HTTP client for making log API calls.
- **Dotenv**: Environment variable management.

## Submission Details
- **Name**: Santosh Patel
- **Roll Number**: 2300321540
- **GitHub**: Santoshpatel112
# 2300321540166
