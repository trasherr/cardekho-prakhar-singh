FROM oven/bun:alpine AS api-deps
WORKDIR /app/api
COPY ./cardekho.api/ ./
RUN bun install --frozen-lockfile

FROM nginx:alpine
COPY --from=ghcr.io/oven-sh/bun:alpine /usr/local/bin/bun /usr/local/bin/bun
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY ./cardekho.web/cardekho.web/dist/cardekho.web/browser /usr/share/nginx/html
COPY --from=api-deps /app/api /app/api
COPY ./docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]