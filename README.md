# Video Nexs Player

Telemetry server for tracking unified-video-framework usage.

## Server URLs

- **Production URL**: http://videonexs-player.flicknexs.com
- **Dashboard**: http://videonexs-player.flicknexs.com/dashboard
- **Ping Endpoint**: http://videonexs-player.flicknexs.com/ping

## Server Details

- **Domain**: videonexs-player.flicknexs.com
- **IP Address**: 157.90.215.126
- **Port**: 2881

## Installation

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your credentials
3. Install dependencies:
```bash
npm install
```

## Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## Environment Variables

Create a `.env` file with the following variables:

```
PORT=2881
SERVER_URL=http://videonexs-player.flicknexs.com
DOMAIN=videonexs-player.flicknexs.com
DB_HOST=localhost
DB_PORT=3306
DB_NAME=videonexsplayerf_info
DB_USERNAME=videonexsplayerf_info
DB_PASSWORD=your_password_here
```

## API Endpoints

### POST /ping
Receives telemetry data from video player instances.

### GET /dashboard
Displays usage statistics and history.

