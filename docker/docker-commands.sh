#!/bin/bash

# MultiLangContentManager Docker Management Script
# This script provides convenient commands for managing the Docker deployment

set -e

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Get the project root (parent of docker directory)
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker and Docker Compose are installed
check_requirements() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    print_success "Docker and Docker Compose are available"
}

# Production deployment
start_production() {
    print_status "Starting MultiLangContentManager in production mode..."

    # Change to project root directory
    cd "$PROJECT_ROOT"

    # Create necessary directories
    mkdir -p logs config backups

    # Build and start services using docker-compose file in docker/ directory
    docker-compose -f docker/docker-compose.yml up -d

    print_success "Production deployment started!"
    print_status "Services available at:"
    echo "  📱 MultiLang App: http://localhost:3000"
    echo "  🍃 MongoDB: localhost:27017"
    echo "  📊 Mongo Express: http://localhost:8081"
    echo "  🔀 Traefik Dashboard: http://localhost:8080"
    echo ""
    echo "With local DNS (multilang.home.local):"
    echo "  📱 MultiLang App: http://multilang.home.local"
    echo "  📊 Mongo UI: http://mongo.home.local"
    echo "  🔀 Traefik: http://traefik.home.local"
}

# Development deployment
start_development() {
    print_status "Starting MultiLangContentManager in development mode..."

    # Change to project root directory
    cd "$PROJECT_ROOT"

    # Create necessary directories
    mkdir -p logs config backups

    # Build and start development services
    docker-compose -f docker/docker-compose.dev.yml up -d

    print_success "Development deployment started!"
    print_status "Services available at:"
    echo "  📱 MultiLang App (with live reload): http://localhost:3000"
    echo "  🍃 MongoDB: localhost:27017"
    echo "  📊 Mongo Express: http://localhost:8081"
}

# Stop services
stop_services() {
    print_status "Stopping MultiLangContentManager services..."

    cd "$PROJECT_ROOT"

    docker-compose -f docker/docker-compose.yml down 2>/dev/null || true
    docker-compose -f docker/docker-compose.dev.yml down 2>/dev/null || true

    print_success "Services stopped"
}

# Clean deployment (remove volumes)
clean_deployment() {
    print_warning "This will remove all data including database volumes!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Cleaning deployment..."

        cd "$PROJECT_ROOT"

        docker-compose -f docker/docker-compose.yml down -v 2>/dev/null || true
        docker-compose -f docker/docker-compose.dev.yml down -v 2>/dev/null || true

        # Remove unused images
        docker image prune -f

        print_success "Deployment cleaned"
    else
        print_status "Clean operation cancelled"
    fi
}

# Show logs
show_logs() {
    local service=$1
    cd "$PROJECT_ROOT"

    if [ -z "$service" ]; then
        print_status "Showing logs for all services..."
        docker-compose -f docker/docker-compose.yml logs -f 2>/dev/null || docker-compose -f docker/docker-compose.dev.yml logs -f
    else
        print_status "Showing logs for service: $service"
        docker-compose -f docker/docker-compose.yml logs -f "$service" 2>/dev/null || docker-compose -f docker/docker-compose.dev.yml logs -f "$service"
    fi
}

# Status check
status_check() {
    print_status "Checking service status..."

    cd "$PROJECT_ROOT"

    echo ""
    echo "🐳 Docker Containers:"
    docker ps --filter "label=com.docker.compose.project=multilangcontentmanager" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || \
    docker ps --filter "name=multilang" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

    echo ""
    echo "📊 Docker Volumes:"
    docker volume ls --filter "label=com.docker.compose.project=multilangcontentmanager" 2>/dev/null || \
    docker volume ls --filter "name=multilang"

    echo ""
    echo "🌐 Network:"
    docker network ls --filter "label=com.docker.compose.project=multilangcontentmanager" 2>/dev/null || \
    docker network ls --filter "name=multilang"
}

# Backup database
backup_database() {
    local backup_name="multilang-backup-$(date +%Y%m%d-%H%M%S)"

    print_status "Creating database backup: $backup_name"

    cd "$PROJECT_ROOT"
    mkdir -p backups

    # Check which compose file is running
    if docker-compose -f docker/docker-compose.yml ps mongodb &>/dev/null; then
        COMPOSE_FILE="docker/docker-compose.yml"
    elif docker-compose -f docker/docker-compose.dev.yml ps mongodb &>/dev/null; then
        COMPOSE_FILE="docker/docker-compose.dev.yml"
    else
        print_error "MongoDB container not found. Make sure services are running."
        exit 1
    fi

    docker-compose -f "$COMPOSE_FILE" exec mongodb mongodump --db multilang-content --out /tmp/backup
    docker cp $(docker-compose -f "$COMPOSE_FILE" ps -q mongodb):/tmp/backup ./backups/$backup_name

    print_success "Backup created: ./backups/$backup_name"
}

# Update application
update_application() {
    print_status "Updating MultiLangContentManager..."

    cd "$PROJECT_ROOT"

    # Pull latest changes (if in git repo)
    if [ -d ".git" ]; then
        git pull
    fi

    # Rebuild and restart services - try both compose files
    if docker-compose -f docker/docker-compose.yml ps multilang &>/dev/null; then
        docker-compose -f docker/docker-compose.yml build --no-cache multilang
        docker-compose -f docker/docker-compose.yml up -d multilang
    elif docker-compose -f docker/docker-compose.dev.yml ps multilang-dev &>/dev/null; then
        docker-compose -f docker/docker-compose.dev.yml build --no-cache multilang-dev
        docker-compose -f docker/docker-compose.dev.yml up -d multilang-dev
    else
        print_error "No running MultiLang containers found"
        exit 1
    fi

    print_success "Application updated"
}

# Show help
show_help() {
    echo "MultiLangContentManager Docker Management"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start-prod     Start production deployment"
    echo "  start-dev      Start development deployment"
    echo "  stop           Stop all services"
    echo "  clean          Stop and remove all data (WARNING: destructive)"
    echo "  logs [service] Show logs (optionally for specific service)"
    echo "  status         Show status of all services"
    echo "  backup         Create database backup"
    echo "  update         Update and restart application"
    echo "  help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start-prod              # Start production"
    echo "  $0 start-dev               # Start development"
    echo "  $0 logs multilang          # Show app logs"
    echo "  $0 logs                    # Show all logs"
    echo ""
    echo "Note: All Docker files are now organized in the docker/ directory"
    echo "Project root: $PROJECT_ROOT"
}

# Main script logic
main() {
    case "$1" in
        "start-prod")
            check_requirements
            start_production
            ;;
        "start-dev")
            check_requirements
            start_development
            ;;
        "stop")
            stop_services
            ;;
        "clean")
            clean_deployment
            ;;
        "logs")
            show_logs "$2"
            ;;
        "status")
            status_check
            ;;
        "backup")
            backup_database
            ;;
        "update")
            update_application
            ;;
        "help"|"--help"|"-h")
            show_help
            ;;
        "")
            # Show help by default when no arguments provided
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"