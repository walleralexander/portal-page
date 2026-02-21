FROM nginx:alpine

# Copy static files to nginx html directory
COPY index.html /usr/share/nginx/html/
COPY app.js /usr/share/nginx/html/
COPY styles.css /usr/share/nginx/html/
COPY enhancements.css /usr/share/nginx/html/
COPY admin.css /usr/share/nginx/html/
COPY keyboard-shortcuts.js /usr/share/nginx/html/
COPY search-feature.js /usr/share/nginx/html/
COPY analytics.js /usr/share/nginx/html/
COPY admin.js /usr/share/nginx/html/
COPY manifest.json /usr/share/nginx/html/
COPY service-worker.js /usr/share/nginx/html/
COPY offline.html /usr/share/nginx/html/

# Copy plugin system + built-in plugins
COPY plugins/ /usr/share/nginx/html/plugins/
COPY favicon/ /usr/share/nginx/html/favicon/
COPY img/ /usr/share/nginx/html/img/

# Create config directory (will be mounted as volume)
RUN mkdir -p /data/config

# Copy example config as fallback (user should mount their own links.yaml)
COPY config/links.yaml.example /data/config/links.yaml

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
