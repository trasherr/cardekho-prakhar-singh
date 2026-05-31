FROM oven/bun:alpine

WORKDIR /app/api
COPY ./cardekho.api/ ./
RUN bun install --frozen-lockfile

EXPOSE 10000

CMD ["bun", "run", "start"]