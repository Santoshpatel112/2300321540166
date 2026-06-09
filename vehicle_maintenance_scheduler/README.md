# Vehicle Maintenance Scheduler

A backend service to manage and schedule vehicle maintenance activities.

## Features
- Create maintenance schedules.
- Retrieve all schedules.
- Update schedule status (e.g., `scheduled`, `in-progress`, `completed`).
- Integrated centralized logging.

## Endpoints
- `POST /schedule`: Create a new schedule.
- `GET /schedules`: List all schedules.
- `PATCH /schedule/:id`: Update status of a specific schedule.
