# MP3 File Analysis API

An Express.js API for analyzing and processing MP3 files with structured logging and comprehensive error handling.

## Features

- Express.js 5 API with TypeScript
- MP3 upload endpoint that returns MPEG Version 1 Layer 3 frame count
- Interactive Swagger UI API documentation at `/api-docs`
- Structured JSON logging with Winston
- HTTP request logging with Morgan
- CORS support
- Request-scoped logging with unique request IDs
- Docker and local development environments
- TypeScript strict mode compilation
- ESLint and Prettier for code quality

## Prerequisites

- **Node.js** 22+ (for local development)
- **npm** 10+ (for local development)
- **Docker** and **Docker Compose** (for running in containers)

## Installation

### Clone the Repository

```bash
git clone <repository-url>
cd mp3-file-analysis-api
npm install
```

## Environment Configuration

Create a `.env` file in the project root with the following variables:

```env
# Application Environment
NODE_ENV=development

# Logging Configuration
# Options: silly, debug, verbose, info, warn, error
LOG_LEVEL=silly

# Server Configuration
SERVER_PORT=8000
SERVER_URL=localhost:8000
SERVER_SECURE_COOKIES=false
```

### Environment Variables Explained

| Variable                | Required | Type    | Options                                              | Description                   |
| ----------------------- | -------- | ------- | ---------------------------------------------------- | ----------------------------- |
| `NODE_ENV`              | Yes      | String  | `development`, `staging`, `production`               | Application environment       |
| `LOG_LEVEL`             | Yes      | String  | `silly`, `debug`, `verbose`, `info`, `warn`, `error` | Logging verbosity level       |
| `SERVER_PORT`           | Yes      | Number  | Any valid port                                       | Port the server listens on    |
| `SERVER_URL`            | Yes      | String  | URL string                                           | Server URL for identification |
| `SERVER_SECURE_COOKIES` | Yes      | Boolean | `true`, `false`                                      | Enable secure cookies         |

## Running the Application

### Local Development (Recommended)

1. Install dependencies:

```bash
npm install
```

2. Start the API:

```bash
npm run start
```

3. Confirm the server is running on the configured `SERVER_PORT` (default: `8000`).

### Docker

1. Build and run:

```bash
docker compose up --build
```

2. Stop containers:

```bash
docker compose down
```

The API is exposed on `http://localhost:8000`.

## API Documentation (Swagger)

Once the app is running, open:

- `http://localhost:8000/api-docs`

Swagger UI is generated from OpenAPI annotations in route files and includes request/response schemas for the upload endpoint.

## How to Test the Application

### Endpoint Details

- Method: `POST`
- Path: `/file-upload`
- Content-Type: `multipart/form-data`
- Form field name: `file`

### Example Test with curl

Run this command in a new terminal while the app is running:

```bash
curl -X POST http://localhost:8000/file-upload \
  -F 'file=@"/absolute/path/to/audio.mp3";type=audio/mpeg'
```

Expected success response (`200`):

```json
{
  "frameCount": 358
}
```

Possible validation responses (`400`):

```json
{ "message": "No MP3 file found in request" }
```

```json
{ "message": "Only MP3 files are supported" }
```

```json
{ "message": "Uploaded MP3 file is empty" }
```

## Response Headers

All responses include a custom header for request tracking:

```
MP3-FILE-ANALYSIS-ID: <unique-request-id>
```

## Project Structure

```
src/
├── app.ts                          # Application entry point
├── server/
│   ├── controllers/                # Request handlers
│   │   └── mp3-file-analysis.controller.ts
│   └── routes/                     # API routes
│       ├── index.ts
│       └── mp3-file-analysis.router.ts
├── helpers/                        # Helper functions
│   ├── app.helper.ts
│   └── express.helper.ts
├── utils/                          # Utility functions
│   ├── environment.util.ts         # Environment configuration
│   ├── express.util.ts             # Express app setup
│   ├── morgan.util.ts              # HTTP logging setup
│   └── winston.util.ts             # Logger configuration
└── types/                          # TypeScript type definitions
    ├── Environment.ts
    └── Request.ts
```

## Scripts

- `npm run start` - Start the application with hot-reload
- `npm test` - Run Mocha tests with NYC coverage reporting
- `npm run build` - Build TypeScript to JavaScript
- `npm run check-compile` - Type-check without emitting build output
- `npm run lint` - Run ESLint checks
- `npm run check-format` - Check formatting differences
- `npm run format` - Format code with Prettier
- `npm run pre-push` - Run formatting, compile checks, and linting

## Development

### Code Style

The project uses:

- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety

### Debugging

#### Node Inspector

The application supports Node's built-in debugger:

```bash
# Using Docker
docker compose up
# Then connect to ws://localhost:9229 in your debugger
```

## License

UNLICENSED
