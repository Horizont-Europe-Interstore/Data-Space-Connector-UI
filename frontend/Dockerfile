# Stage 1
FROM node:18.18.2-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build


# Stage 2 with nginx

# nginx state for serving content
FROM nginx:alpine

# Copy config
COPY ./config/nginx.conf /etc/nginx/conf.d/ui-nginx.conf

# Remove default nginx static assets and configuration
RUN rm -rf /usr/share/nginx/html/*

# Copy static assets from builder stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Containers run nginx with global directives and daemon off
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]