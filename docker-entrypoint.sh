#!/bin/sh
set -e

# Start the Bun API on port 10000 in the background
cd /app/api
PORT=10000 bun run start &

# Start nginx in the foreground
nginx -g "daemon off;"