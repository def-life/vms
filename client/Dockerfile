# Build Stage
FROM node:20-alpine AS builder
LABEL maintainer="abhishek"
WORKDIR /usr/app
COPY package*.json ./
RUN npm  ci
COPY . .
RUN npm run build

# Production Stage
FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /usr/app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]