# Stage 1: build the React app
FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY stubs/ ./stubs/

# --ignore-scripts skips native compilation for canvas and node-sass (test/legacy devDeps).
# The lock file incorrectly links @netdata/react-filter-box to a non-existent path inside
# netdata-ui; correct the symlink after install.
RUN npm install --legacy-peer-deps --ignore-scripts && \
    rm -rf node_modules/node-sass && \
    rm -rf node_modules/@netdata/react-filter-box && \
    ln -sf ../../stubs/react-filter-box node_modules/@netdata/react-filter-box

COPY . .
RUN NODE_OPTIONS=--openssl-legacy-provider npm run build

# Stage 2: serve with nginx
FROM nginx:alpine

# Copy build artifacts into the expected URL paths
RUN mkdir -p /usr/share/nginx/html/v1
COPY --from=builder /app/build/index.html          /usr/share/nginx/html/v1/index.html
COPY --from=builder /app/build/static              /usr/share/nginx/html/v1/static
COPY --from=builder /app/build/dashboard-react.js  /usr/share/nginx/html/v1/dashboard-react.js
COPY --from=builder /app/build/dashboard-react.js  /usr/share/nginx/html/dashboard-react.js
COPY --from=builder /app/build/dashboard_info.js   /usr/share/nginx/html/dashboard_info.js
COPY --from=builder /app/build/css                 /usr/share/nginx/html/css
COPY --from=builder /app/build/fonts               /usr/share/nginx/html/fonts

COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENV NETDATA_URL=http://localhost:19999

EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]
