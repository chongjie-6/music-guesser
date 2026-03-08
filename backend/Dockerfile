# syntax=docker/dockerfile:1
ARG NODE_VERSION=22.13.0

# Stage 1: Build the frontend
FROM node:${NODE_VERSION}-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Run the backend
FROM node:${NODE_VERSION}-alpine AS final
ENV NODE_ENV=production
WORKDIR /usr/src/app

# Install backend production dependencies
COPY backend/package.json backend/package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev --ignore-scripts

# Copy backend source
COPY backend/ ./

# Copy built frontend into the expected location
COPY --from=frontend-build /frontend/dist ../frontend/dist

USER node
EXPOSE 3500
CMD ["node", "server.js"]
