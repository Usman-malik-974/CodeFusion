# ✅ Use Docker-in-Docker image as base
FROM docker:24.0.5-dind

# ✅ Install required packages
RUN apk add --no-cache \
    nodejs npm \
    bash \
    redis \
    python3 \
    openjdk17 \
    git \
    g++ make

# ✅ Set working directory
WORKDIR /app

# ✅ Copy package.json and install Node.js dependencies
COPY package*.json ./
RUN npm install

# ✅ Copy all other backend files
COPY . .

# ✅ Expose backend server port
EXPOSE 3000

# ✅ Start Docker daemon, Redis, runner containers, and server
CMD sh -c "dockerd-entrypoint.sh & \
    sleep 5 && \
    docker run -dit --init --name redis -p 6379:6379 redis --appendonly yes && \
    docker run -dit --init --name cpp-runner -v /app/temp:/app -w /app gcc:latest tail -f /dev/null && \
    docker run -dit --init --name python-runner -v /app/temp:/app -w /app python:3.10-alpine tail -f /dev/null && \
    docker run -dit --init --name java-runner -v /app/temp:/app -w /app openjdk:17-alpine tail -f /dev/null && \
    docker run -dit --init --name node-runner -v /app/temp:/app -w /app node:18-alpine tail -f /dev/null && \
    node server.js"
