# Use the official lightweight Bun image
FROM oven/bun:alpine

# Set working directory to the API directory
WORKDIR /app

# Copy the API files and install dependencies
COPY ./cardekho.api/ ./
RUN bun install

# Copy the pre-built Angular files from the GitHub Actions runner
# directly into the backend's "public" folder.
COPY ./cardekho.web/cardekho.web/dist/cardekho.web/browser ./public

# Expose the port your backend runs on
EXPOSE 10000

# Add an application-level health check
HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:10000/ || exit 1

# Start the backend API (change index.ts to your actual main file if different)
CMD ["bun", "run", "index.ts"]
