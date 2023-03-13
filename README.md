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
POSTGRES_PORT=5432
POSTGRES_DB=your_awesome_database_name
DATABASE_URL=postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:${POSTGRES_PORT}/${POSTGRES_DB}

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
For the websocket documentation, with chat rooms, chat between two user, etc, [read this dedicated readme](https://github.com/sdummett/ft_transcendence/blob/sdummett/ChatREADME.md).
