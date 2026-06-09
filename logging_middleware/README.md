# Logging Middleware

A reusable logging package designed to send centralized logs to the AffordMed evaluation server.

## Features
- Centralized logging for both Frontend and Backend.
- Supports multiple log levels: `debug`, `info`, `warn`, `error`, `fatal`.
- Automated token management via `setup.js`.

## API
### `log(stack, level, package, message)`
- `stack`: String (`backend` | `frontend`)
- `level`: String (`debug` | `info` | `warn` | `error` | `fatal`)
- `package`: String (e.g., `handler`, `db`, `auth`)
- `message`: Descriptive log message
