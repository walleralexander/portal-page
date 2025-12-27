FROM nginx:alpine

# Copy static files to nginx html directory
COPY index.html /usr/share/nginx/html/
COPY app.js /usr/share/nginx/html/
COPY styles.css /usr/share/nginx/html/

# Create config directory (will be mounted as volume)
RUN mkdir -p /data/config

# Copy example config as fallback (user should mount their own links.yaml)
COPY config/links.yaml.example /data/config/links.yaml

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
