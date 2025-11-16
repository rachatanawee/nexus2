# Docker Deployment Guide

## Quick Start

### 1. Build and Run with Docker Compose

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### 2. Build Docker Image Only

```bash
# Build image
docker build -t nexus-app .

# Run container
docker run -p 3000:3000 --env-file .env.local nexus-app
```

## Environment Variables

Create `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Production Deployment

### AWS ECS / Fargate

```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
docker build -t nexus-app .
docker tag nexus-app:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/nexus-app:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/nexus-app:latest
```

### Docker Hub

```bash
# Build and push
docker build -t username/nexus-app .
docker push username/nexus-app
```

### DigitalOcean / Railway / Render

Upload `Dockerfile` and set environment variables in platform dashboard.

## Health Check

The app includes a health check endpoint:
- URL: `http://localhost:3000`
- Interval: 30s
- Timeout: 10s
- Retries: 3

## Troubleshooting

### Build fails
```bash
# Clear cache and rebuild
docker-compose build --no-cache
```

### Container exits immediately
```bash
# Check logs
docker-compose logs app
```

### Port already in use
```bash
# Change port in docker-compose.yml
ports:
  - "3001:3000"
```
