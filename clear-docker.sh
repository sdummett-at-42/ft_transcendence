#!/bin/bash

# Stop and remove all running containers:
docker stop $(docker ps -a -q)
docker rm $(docker ps -a -q)

# Remove all images:
docker rmi $(docker images -a -q)

# Remove all volumes:
docker volume rm $(docker volume ls -q)

# Remove all networks:
docker network rm $(docker network ls -q)
