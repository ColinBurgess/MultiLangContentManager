# 🐳 Docker Deployment Guide

Complete guide for deploying MultiLangContentManager using Docker and Docker Compose.

## 📁 **New Organized Structure**

All Docker-related files are now organized in the `docker/` directory for better project structure:

```
MultiLangContentManager/
├── docker/                    # 🐳 All Docker files organized here
│   ├── Dockerfile            # Production image
│   ├── Dockerfile.dev        # Development image
│   ├── docker-compose.yml    # Production stack
│   ├── docker-compose.dev.yml # Development stack
│   ├── .dockerignore         # Build exclusions
│   ├── docker-commands.sh    # Management script
│   ├── README.md             # This documentation
│   ├── mongo-init/           # MongoDB initialization
│   └── traefik/              # Traefik configuration
├── server/                   # 📱 Application code
├── client/                   # 🎨 Frontend code
├── utils/                    # 🔧 Utilities
└── ... (rest of project)     # Clean project structure
```

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Architecture](#-architecture)
- [Deployment Options](#-deployment-options)
- [Configuration](#-configuration)
- [Management](#-management)
- [Networking](#-networking)
- [Backup & Restore](#-backup--restore)
- [Troubleshooting](#-troubleshooting)

## 🚀 Quick Start

### Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- 2GB+ RAM available
- 1GB+ disk space

### One-Command Deploy

```bash
# From project root directory:

# Production deployment
./docker/docker-commands.sh start-prod

# Development deployment (with live reload)
./docker/docker-commands.sh start-dev
```

### Manual Deployment

```bash
# Clone and enter project directory
git clone <repository-url>
cd MultiLangContentManager

# Create necessary directories
mkdir -p logs config backups

# Start production services
docker-compose -f docker/docker-compose.yml up -d

# Check status
docker-compose -f docker/docker-compose.yml ps
```

## 🏗️ Architecture

### Container Stack

```
┌─────────────────────────────────────────┐
│               Traefik                   │
│        (Reverse Proxy + SSL)           │
│         Port: 80, 443, 8080            │
└─────────────────┬───────────────────────┘
                  │
        ┌─────────┴──────────┐
        │                    │
┌───────▼─────────┐  ┌──────▼──────┐
│   MultiLang     │  │   MongoDB   │
│   Application   │  │   Database  │
│   Port: 3000    │  │ Port: 27017 │
└─────────────────┘  └─────────────┘
        │
┌───────▼─────────┐
│  Mongo Express  │
│   (Web UI)      │
│   Port: 8081    │
└─────────────────┘
```

### Services Overview

| Service | Description | Ports | Purpose |
|---------|-------------|-------|---------|
| `multilang` | Main application | 3000 | Core Node.js app |
| `mongodb` | Database | 27017 | Data persistence |
| `traefik` | Reverse proxy | 80,443,8080 | Traffic routing + SSL |
| `mongo-express` | DB admin UI | 8081 | Database management |

## 🎯 Deployment Options

### 1. Production Deployment

**Use case**: Stable homelab deployment

```bash
# Start production stack (from project root)
docker-compose -f docker/docker-compose.yml up -d

# Or use management script
./docker/docker-commands.sh start-prod

# Services available at:
# - App: http://localhost:3000
# - MongoDB: localhost:27017
# - Mongo UI: http://localhost:8081
# - Traefik: http://localhost:8080
```

**Features**:
- ✅ Optimized images (multi-stage build)
- ✅ Health checks
- ✅ Automatic restart
- ✅ Volume persistence
- ✅ Security hardening

### 2. Development Deployment

**Use case**: Active development with live reload

```bash
# Start development stack (from project root)
docker-compose -f docker/docker-compose.dev.yml up -d

# Or use management script
./docker/docker-commands.sh start-dev

# Code changes automatically reload
```

**Features**:
- ✅ Live reload with nodemon
- ✅ Source code mounted as volumes
- ✅ Development database
- ✅ Relaxed CORS settings

### 3. Production with Local DNS

**Use case**: Homelab with custom domains

```bash
# Add to your router/Pi-hole DNS:
192.168.1.100  multilang.home.local
192.168.1.100  mongo.home.local
192.168.1.100  traefik.home.local

# Or add to /etc/hosts on each device:
echo "192.168.1.100  multilang.home.local" >> /etc/hosts
```

**Access**:
- 📱 **App**: http://multilang.home.local
- 📊 **Mongo UI**: http://mongo.home.local
- 🔀 **Traefik**: http://traefik.home.local

## ⚙️ Configuration

### Environment Variables

The docker-compose files include default environment variables. For customization:

```bash
# Edit docker-compose files directly or create .env file in project root
nano docker/docker-compose.yml
```

Key variables:

```bash
# Application
NODE_ENV=production
PORT=3000

# Database
MONGODB_URI=mongodb://mongodb:27017/multilang-content

# Security
ALLOWED_ORIGINS=http://localhost,http://multilang.home.local

# Optional features
ENABLE_PYTHON_PARSER=true
LOG_LEVEL=info
```

### Custom MongoDB Configuration

```bash
# Edit MongoDB init script
nano docker/mongo-init/init-db.js

# Add custom indexes, users, or sample data
```

### Traefik Configuration

```bash
# Custom Traefik settings
mkdir -p docker/traefik
nano docker/traefik/traefik.yml
```

## 🛠️ Management

### Using Management Script (Recommended)

The management script automatically handles paths and provides convenient commands:

```bash
# Helper script for common operations (run from project root)
./docker/docker-commands.sh [COMMAND]

# Available commands:
start-prod     # Start production deployment
start-dev      # Start development deployment
stop           # Stop all services
status         # Show service status
logs [service] # Show logs
backup         # Create database backup
update         # Update application
clean          # Remove all data (WARNING)
```

### Manual Docker Commands

```bash
# All commands should be run from project root with -f flag:

# View service status
docker-compose -f docker/docker-compose.yml ps

# View logs
docker-compose -f docker/docker-compose.yml logs -f multilang
docker-compose -f docker/docker-compose.yml logs -f mongodb

# Update specific service
docker-compose -f docker/docker-compose.yml build --no-cache multilang
docker-compose -f docker/docker-compose.yml up -d multilang

# Access container shell
docker-compose -f docker/docker-compose.yml exec multilang sh
docker-compose -f docker/docker-compose.yml exec mongodb mongosh
```

### Resource Monitoring

```bash
# Container resource usage
docker stats

# Disk usage
docker system df

# Clean unused resources
docker system prune -f
```

## 🌐 Networking

### Default Network Setup

- **Network**: `multilang-network` (172.20.0.0/16)
- **Driver**: bridge
- **Internal communication**: Containers can reach each other by service name

### Port Mapping

| Container Port | Host Port | Service |
|----------------|-----------|---------|
| 3000 | 3000 | MultiLang App |
| 27017 | 27017 | MongoDB |
| 8081 | 8081 | Mongo Express |
| 80 | 80 | Traefik HTTP |
| 443 | 443 | Traefik HTTPS |
| 8080 | 8080 | Traefik Dashboard |

### Firewall Configuration

```bash
# If using UFW (Ubuntu firewall)
sudo ufw allow 3000
sudo ufw allow 8081
sudo ufw allow 80
sudo ufw allow 443
```

## 💾 Backup & Restore

### Automated Backup

```bash
# Create backup using management script (from project root)
./docker/docker-commands.sh backup

# Backup created at: ./backups/multilang-backup-YYYYMMDD-HHMMSS/
```

### Manual Backup

```bash
# Database backup (from project root)
docker-compose -f docker/docker-compose.yml exec mongodb mongodump --db multilang-content --out /tmp/backup
docker cp $(docker-compose -f docker/docker-compose.yml ps -q mongodb):/tmp/backup ./backups/manual-backup-$(date +%Y%m%d)

# Application data backup
tar -czf app-backup-$(date +%Y%m%d).tar.gz logs config
```

### Restore from Backup

```bash
# Stop services (from project root)
docker-compose -f docker/docker-compose.yml down

# Restore database
docker-compose -f docker/docker-compose.yml up -d mongodb
docker cp ./backups/backup-folder $(docker-compose -f docker/docker-compose.yml ps -q mongodb):/tmp/restore
docker-compose -f docker/docker-compose.yml exec mongodb mongorestore --db multilang-content /tmp/restore/multilang-content

# Start all services
docker-compose -f docker/docker-compose.yml up -d
```

## 🔧 Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Check what's using the port
sudo lsof -i :3000

# Kill process or change port in docker-compose.yml
ports:
  - "3001:3000"  # Change host port
```

#### Database Connection Issues

```bash
# Check MongoDB container (from project root)
docker-compose -f docker/docker-compose.yml logs mongodb

# Check network connectivity
docker-compose -f docker/docker-compose.yml exec multilang ping mongodb

# Verify environment variables
docker-compose -f docker/docker-compose.yml exec multilang env | grep MONGODB
```

#### Container Won't Start

```bash
# View detailed logs (from project root)
docker-compose -f docker/docker-compose.yml logs multilang

# Check container health
docker-compose -f docker/docker-compose.yml ps
docker inspect multilang-app

# Rebuild without cache
docker-compose -f docker/docker-compose.yml build --no-cache multilang
```

### Debug Mode

```bash
# Run in development mode with more verbose logging (from project root)
NODE_ENV=development docker-compose -f docker/docker-compose.dev.yml up

# Access container for debugging
docker-compose -f docker/docker-compose.yml exec multilang sh
```

### Performance Optimization

```bash
# Enable Docker BuildKit for faster builds
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Use multi-stage builds (already configured in Dockerfile)
# Optimize image size
docker images | grep multilang
```

## 📊 Monitoring

### Health Checks

The application includes built-in health checks:

```bash
# Check health status (from project root)
docker-compose -f docker/docker-compose.yml ps
# Healthy containers show "(healthy)" status

# Manual health check
curl http://localhost:3000/api/system/routes
```

### Resource Limits

Configure in `docker/docker-compose.yml`:

```yaml
services:
  multilang:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 256M
```

## 🔐 Security

### Production Security Checklist

- [ ] Change default MongoDB passwords in `docker/docker-compose.yml`
- [ ] Use environment variables for secrets
- [ ] Enable Traefik SSL certificates
- [ ] Configure firewall rules
- [ ] Regular security updates
- [ ] Monitor container logs
- [ ] Backup encryption

### SSL/TLS Setup

```yaml
# Add to traefik service in docker/docker-compose.yml
command:
  - "--certificatesresolvers.letsencrypt.acme.email=your-email@domain.com"
  - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
  - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"

# Add to multilang service labels
labels:
  - "traefik.http.routers.multilang.tls=true"
  - "traefik.http.routers.multilang.tls.certresolver=letsencrypt"
```

## 📞 Support

For issues and questions:

1. Check logs: `docker-compose -f docker/docker-compose.yml logs`
2. Review troubleshooting section above
3. Use the management script for common operations: `./docker/docker-commands.sh help`
4. Check GitHub issues
5. Create new issue with container logs and system info

---

**Happy containerizing! 🐳**

**Remember**: All Docker commands should be run from the project root directory, and all Docker files are organized in the `docker/` subdirectory for better project structure.