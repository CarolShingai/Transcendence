# =========================================
# Stage 1: Build the Angular Application
# =========================================

# Use a lightweight Node.js image for building
FROM node:24-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package-related files first to leverage Docker's caching mechanism
COPY package.json package-lock.json* ./

# Install project dependencies using npm ci (ensures a clean, reproducible install)
RUN --mount=type=cache,target=/root/.npm npm ci

# Copy the rest of the application source code into the container
COPY . .

# Build the Angular application
RUN npm run build 

# =========================================
# Stage 2: Prepare Nginx to Serve Static Files
# =========================================

FROM nginx:alpine AS runner

# Copy the static build output from the build stage to Nginx's default HTML serving directory
COPY --from=builder /app/dist/*/browser /usr/share/nginx/html

# Expose port 80 to allow HTTP traffic 
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]