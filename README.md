# ft_transcendence

## Running the Project

To launch the project, please run the following command:

`docker-compose up --build`

This will build the images and start the containers needed to run the project.

## API Documentation

Once the project is running, you can find the API documentation at the following endpoint:

`/api`

## Environment Variables

The project requires a .env file at the root of the project to run properly.
This file should be kept secret and not shared publicly. The contents of the .env file should look like the following:

```
# Database connection informations
POSTGRES_USER=my_super_user
POSTGRES_PASSWORD=my_super_secret_password
POSTGRES_DB=your_awesome_database_name
DATABASE_URL=postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}

# The session secret used to encrypt the user session data
SESSION_SECRET=your_omega_session_secret

# The port where the backend server will listen
APP_PORT=3001

# Used for rate-limiting the clients
THROTTLER_TTL=60
THROTTLER_LIMIT=100

# Redis connection informations
REDIS_HOST=your_redis_host_name
REDIS_PORT=6379
REDIS_URL="redis://${REDIS_HOST}:${REDIS_PORT}"

# 42 API secret used for oauth
FORTYTWO_CLIENT_ID=your_super_client_id
FORTYTWO_CLIENT_SECRET=your_omega_client_secret
FORTYTWO_CALLBACK_URL=http://localhost:3001/auth/42/callback
```

Please make sure to replace the values with your own values.

## Websocket Documentation

I'm having hard time implementing websockets documentation into swagger.  
For now I will describe the current state of the ws implementation here.  
For each event I explain its purpose, the expected received data and the returned data.  

### Chat using rooms

| Event name   | Received data  | Returned data | Description |
|--------------|-----------|------------|---|
| logout       | none      | none        | Disconnect all the connected sockets of a user. |
| create       | `{ roomName: string, isPublic: boolean, password?: string }` | | Create a room that can be private/public and/or password protected or not |
| join         | `{ roomName: string, password?: string}` | | Attempt to join a room | 
| leave        | `{ roomName: string }` | | Leave a room, if the leaver is the owner then a new owner is set. If no more user is in the room then the room is destroyed |
| ban*         | `{ roomName: string, userId: number }` | | Ban a user from a room. Its has no limit on the time. The user will not be able to join the room even if invited.  |
| unban*       | `{ roomName: string, userId: number }` | | Unban a user. |
| mute*        | `{ roomName: string, userId: number }` | | Mute a user. |
| unmute*      | `{ roomName: string, userId: number }` | | Unmute a user. |
| invite       | `{ roomNamae: string, userId: number }` | | Invite a user in a room. |
| send         | `{ roomName: string, message string }` | | Send a message in a room. |
| update**       | `{ roomName: string, isPublic?: boolean, password?: string }` | | Change the visibility and/or the password of the room |

The `roomName` must be between **1** and **32** characters.  
The `timeout` must be between **30**secs to **1260**secs (21mins).  
The `message` must be between **1** to **150** characters.  

\* The user must have *owner* or *admin* privileges.  
** The user must be the *owner* of the room.  

The returned data isn't well defined yet. (TODO)  
Must implement "kick" event. Same as ban but it's not permanent(TODO)  
Must implement "block" event. A user can avoid receiving message from a specific user. Should we implement it on the frontend? (TODO)  
Must implement "grant" event. A privileged user giving privileges to another (TODO)  
  
Ps: Chat between two users isn't implemented yet.  
