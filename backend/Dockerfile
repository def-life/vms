# Build Stage
FROM node:20-alpine AS builder
LABEL maintainer="abhishek"
WORKDIR /usr/app
COPY package*.json ./
RUN npm  ci
COPY . .
RUN npm run build

# Production Stage
FROM node:20-alpine
WORKDIR /usr/app
RUN apk add --no-cache ffmpeg
COPY --from=builder /usr/app/package*.json ./
COPY --from=builder /usr/app/dist ./dist
RUN npm ci --omit=dev
EXPOSE 4000
ENV NODE_ENV=production
CMD ["npm", "start"]