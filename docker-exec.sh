#!/bin/bash

# Execute a shell in a running container:
if [ $# -eq 1 ]; then
    docker exec -it $1 /bin/sh
else
    echo "Error: This script requires exactly one argument."
fi

