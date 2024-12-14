<h1 align="center">Live Chat WebSocket Microservice</h1>
<div align="center">
<img src="https://cdn.rawgit.com/sindresorhus/awesome/d7305f38d29fed78fa85652e3a63e154dd8e8829/media/badge.svg" alt="Awesome Badge"/>
<img src="https://img.shields.io/static/v1?label=%F0%9F%8C%9F&message=If%20Useful&style=style=flat&color=BC4E99" alt="Star Badge"/>
<a href="https://discord.gg/JgjExyntw4"><img src="https://img.shields.io/discord/733027681184251937.svg?style=flat&label=Join%20Community&color=7289DA" alt="Join Community Badge"/></a>
<a href="https://twitter.com/oristarium"><img src="https://img.shields.io/twitter/follow/oristarium.svg?style=social" /></a>
<br>

<i>A WebSocket-based microservice that provides real-time live chat messages and statistics from multiple platforms (YouTube, TikTok, and Twitch) without requiring their APIs.</i>

<a href="https://github.com/roffidaijoubu/microservice-livechat/stargazers"><img src="https://img.shields.io/github/stars/roffidaijoubu/microservice-livechat" alt="Stars Badge"/></a>
<a href="https://github.com/roffidaijoubu/microservice-livechat/network/members"><img src="https://img.shields.io/github/forks/roffidaijoubu/microservice-livechat" alt="Forks Badge"/></a>
<a href="https://github.com/roffidaijoubu/microservice-livechat/pulls"><img src="https://img.shields.io/github/issues-pr/roffidaijoubu/microservice-livechat" alt="Pull Requests Badge"/></a>
<a href="https://github.com/roffidaijoubu/microservice-livechat/issues"><img src="https://img.shields.io/github/issues/roffidaijoubu/microservice-livechat" alt="Issues Badge"/></a>
<a href="https://github.com/roffidaijoubu/microservice-livechat/graphs/contributors"><img alt="GitHub contributors" src="https://img.shields.io/github/contributors/roffidaijoubu/microservice-livechat?color=2b9348"></a>
<a href="https://github.com/roffidaijoubu/microservice-livechat/blob/master/LICENSE"><img src="https://img.shields.io/github/license/roffidaijoubu/microservice-livechat?color=2b9348" alt="License Badge"/></a>

<h3 align="center">Made with ❤️ by</h3>
<img alt="Oristarium Logo" src="https://ucarecdn.com/87bb45de-4a95-40d7-83c6-73866de942d5/-/crop/5518x2493/1408,2949/-/preview/1000x1000/"> </img>

<i>Love the project? Please consider <a href="https://trakteer.id/oristarium">donating</a> to help us improve!</i>

</div>

## Features

- WebSocket endpoints for real-time chat messages
- Real-time chat statistics tracking
- Support for multiple platforms (YouTube, TikTok, Twitch)
- Support for multiple channels simultaneously
- Support for multiple clients per channel
- Automatic cleanup of inactive streams
- Resource management (stops watching when no clients are connected)
- Error handling and status updates
- Health check endpoint
- Redis support for persistent statistics (optional)

## Local Development

### Installation

```bash
npm install
```

### Running Locally

```bash
# Without Redis (uses in-memory storage)
node server.js

# With Redis
REDIS_URL=redis://localhost:6379 STATS_STORAGE=redis node server.js
```

### Docker Compose

```yaml
services:
  microservice-livechat:
    environment:
      - REDIS_URL=redis://redis:6379
      - STATS_STORAGE=redis
    # ... other config

  redis:
    image: redis:7-alpine
    command: redis-server --save 60 1 --loglevel warning
    volumes:
      - redis-data:/data
```

## WebSocket Protocol

Each WebSocket connection can:
- Subscribe to multiple live chats simultaneously (in separate browser tabs/windows)
- Share live chat subscriptions with other clients
- Maintain independent subscription states
- Receive real-time updates for all subscribed chats

The server will:
- Maintain separate chat handlers for each unique channel
- Share chat handlers between clients watching the same channel
- Clean up chat handlers only when no clients are watching
- Track statistics per channel (either in memory or Redis)

Note: While technically possible to subscribe to multiple chats in one connection, the current test interface (`/test`) is designed to handle one subscription per tab for better user experience and resource management.

### Client Messages

1. Subscribe to a chat:
```javascript
{
    "type": "subscribe",
    "identifier": string,      // Channel username (without @), ID, or livestream ID
    "identifierType": "username" | "channelId" | "liveId", // YouTube only, defaults to "username"
    "platform": "youtube" | "tiktok" | "twitch"      // defaults to "youtube"
}
```

Note: The term "subscribe" here refers to establishing a WebSocket connection to receive chat messages, not subscribing to the channel on the respective platform.

Platform-specific identifier requirements:
- YouTube: Supports username (without @), channel ID (UC...), or live ID (watch?v=...)
- TikTok: Only supports username (without @)
- Twitch: Only supports username (without @)

2. Unsubscribe from current chat:
```javascript
{
    "type": "unsubscribe"
}
```

3. Request current stats:
```javascript
{
    "type": "get_stats"
}
```

### Server Messages

1. Status Updates:
```javascript
{
    "type": "status",
    "status": "started" | "subscribed" | "unsubscribed",
    "liveId": string,     // Only present for "started" status
    "identifier": string  // Only present for "subscribed" status
}
```

2. Error Messages:
```javascript
{
    "type": "error",
    "error": string,
    "code": string,      // Error code for specific errors
    "details": string    // Optional additional error details
}
```

Common error codes:
- `STREAM_NOT_LIVE`: The stream is not currently live
- `STREAM_ENDED`: The stream has ended
- `INVALID_MESSAGE_TYPE`: Unknown message type received
- `NO_ACTIVE_CHAT`: No chat is currently subscribed
- `STREAM_NOT_FOUND`: Stream data not found
- `UNSUPPORTED_PLATFORM`: Platform not supported

3. Chat Messages:
```javascript
{
    "type": "chat",
    "data": {
        "type": "chat",
        "platform": "youtube" | "tiktok" | "twitch",
        "timestamp": "2024-03-20T12:34:56.789Z",
        "message_id": string,
        "room_id": string,
        "data": {
            "author": {
                "id": string,
                "username": string,
                "display_name": string,
                "avatar_url": string,
                "roles": {
                    "broadcaster": boolean,
                    "moderator": boolean,
                    "subscriber": boolean,
                    "verified": boolean
                },
                "badges": [
                    {
                        "type": "subscriber" | "moderator" | "verified" | "custom",
                        "label": string,
                        "image_url": string
                    }
                ]
            },
            "content": {
                "raw": string,        // Original message with emotes
                "formatted": string,  // Message with emote codes
                "sanitized": string,  // Plain text only
                "rawHtml": string,    // Pre-rendered HTML with emotes
                "elements": [         // Message broken into parts
                    {
                        "type": "text" | "emote",
                        "value": string,
                        "position": [number, number],
                        "metadata"?: {  // Only for emotes
                            "url": string,
                            "alt": string,
                            "is_custom": boolean
                        }
                    }
                ]
            },
            "metadata": {
                "type": "chat" | "super_chat",
                "monetary_data"?: {    // Only for super_chat
                    "amount": string,
                    "formatted": string,
                    "color": string
                },
                "sticker"?: {         // Only for sticker super_chats
                    "url": string,
                    "alt": string
                }
            }
        }
    }
}
```

4. Stats Updates:
```javascript
{
    "type": "stats",
    "data": {
        "uniqueUsers": [
            {
                "id": string,
                "username": string,
                "display_name": string,
                "roles": {
                    "broadcaster": boolean,
                    "moderator": boolean,
                    "subscriber": boolean,
                    "verified": boolean
                },
                "messageCount": number
            }
        ],
        "totalMessages": number
    }
}
```

## Example Usage

```javascript
// Use secure WebSocket if needed
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const wsUrl = `${protocol}//${window.location.host}/ws`;  // Note the /ws path
const ws = new WebSocket(wsUrl);

// Connect to YouTube chat using username (default)
ws.send(JSON.stringify({
    type: 'subscribe',
    identifier: 'ceresfauna',
    identifierType: 'username', // this is the default
    platform: 'youtube' // this is the default
}));

// Connect to TikTok chat using username
ws.send(JSON.stringify({
    type: 'subscribe',
    identifier: 'tiktokuser',
    platform: 'tiktok'
}));

// Connect to Twitch chat using username
ws.send(JSON.stringify({
    type: 'subscribe',
    identifier: 'twitchuser',
    platform: 'twitch'
}));

// Handle incoming messages
ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    
    switch (message.type) {
        case 'chat':
            console.log('New chat message:', message.data);
            break;
        case 'stats':
            console.log('Stats update:', message.data);
            break;
        case 'status':
            console.log('Status update:', message.status);
            break;
        case 'error':
            console.error('Error:', message.error, message.code);
            break;
    }
};
```

## Test Interface

The service provides a test interface at `/test` that allows you to:
- Select platform (YouTube, TikTok, or Twitch)
- Connect to different channels
- View live chat messages with badges and emotes
- Monitor chat statistics in real-time
- View top chatters and message counts

## Health Check

GET `/health` - Returns the status of the service and number of active streams:
```javascript
{
    "status": "ok",
    "activeStreams": number
}
```

## Deployment

### Using GitHub Actions

This project includes a CI/CD pipeline that automatically builds and deploys the microservice when you push to the main branch. Here's how to set it up:

1. Fork this repository
2. Set up the following GitHub Secrets in your repository (Settings > Secrets and variables > Actions):

```bash
# Docker Hub Credentials
DOCKER_USERNAME=your_dockerhub_username
DOCKER_PASSWORD=your_dockerhub_token  # Use an access token, not your password

# VPS SSH Details
VPS_SSH_KEY=-----BEGIN OPENSSH PRIVATE KEY-----
            your_private_key_here
            -----END OPENSSH PRIVATE KEY-----
VPS_USER=your_vps_username
VPS_HOST=your_vps_ip_or_domain
DOMAIN=your_websocket_domain  # e.g., wschat.example.com

# Let's Encrypt SSL
TRAEFIK_ACME_EMAIL=your_email@example.com  # Email for SSL certificate notifications
```

Example values:
```bash
# Example VPS_USER
VPS_USER=ubuntu

# Example VPS_HOST
VPS_HOST=123.456.789.0
# or
VPS_HOST=vps.example.com

# Example DOMAIN
DOMAIN=wschat.example.com

# Example TRAEFIK_ACME_EMAIL
TRAEFIK_ACME_EMAIL=admin@example.com
```

3. Set up your VPS:
   - Install Docker and Docker Compose
   - Create the web network:
   ```bash
   docker network create web
   ```
   - Install and configure Traefik (included in the docker-compose.yml)

4. Push to the main branch, and GitHub Actions will:
   - Build the Docker image
   - Push it to Docker Hub
   - Deploy it to your VPS
   - Set up SSL certificates automatically

### Manual Deployment

If you prefer to deploy manually, you can use the following commands on your VPS:

```bash
# Create required directories
mkdir -p /var/www/microservice-livechat
cd /var/www/microservice-livechat

# Create .env file
echo "DOMAIN=your_websocket_domain" > .env

# Download docker-compose.yml
wget https://raw.githubusercontent.com/yourusername/your-repo/main/docker-compose.yml

# Create web network if it doesn't exist
docker network create web

# Start the services
docker-compose up -d
```

The service will be available at:
- WebSocket: `wss://your_domain/ws`
- Test Interface: `https://your_domain/test`
- Health Check: `https://your_domain/health`

## Credits

This project integrates with multiple platforms by leveraging the following excellent open-source projects:

### YouTube Chat Integration
- [youtube-chat](https://github.com/LinaTsukusu/youtube-chat) by LinaTsukusu
- A Node.js library to fetch YouTube live chat without using the YouTube API

### Twitch Chat Integration  
- [twitch-webchat](https://github.com/talmobi/twitch-webchat) by talmobi
- Consume Twitch web chat programmatically without requiring authentication

### TikTok Live Integration
- [TikTok-Live-Connector](https://github.com/zerodytrash/TikTok-Live-Connector) by zerodytrash
- Node.js library to receive TikTok LIVE events in real-time

These libraries made it possible to create a unified chat experience across multiple platforms. Special thanks to all the contributors of these projects! 🙏