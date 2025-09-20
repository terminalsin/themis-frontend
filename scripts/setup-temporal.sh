#!/bin/bash

# Temporal Video Tracking Setup Script
# This script helps set up the Temporal video tracking system

set -e

echo "🚗 Setting up Temporal Video Tracking System..."

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

# Check if Temporal CLI is installed
check_temporal_cli() {
    print_status "Checking Temporal CLI installation..."
    
    if command -v temporal &> /dev/null; then
        print_success "Temporal CLI is installed"
        temporal version
    else
        print_warning "Temporal CLI not found"
        echo "Please install Temporal CLI:"
        echo "  macOS: brew install temporal"
        echo "  Linux: curl -sSf https://temporal.download/cli.sh | sh"
        echo "  Windows: Download from https://github.com/temporalio/cli/releases"
        echo ""
        echo "Or visit: https://docs.temporal.io/cli#install"
        return 1
    fi
}

# Install Node.js dependencies
install_dependencies() {
    print_status "Installing Node.js dependencies..."
    
    if [ -f "package.json" ]; then
        npm install
        print_success "Dependencies installed successfully"
    else
        print_error "package.json not found. Are you in the project root?"
        return 1
    fi
}

# Create workspace directory structure
setup_workspace() {
    print_status "Setting up workspace directory structure..."
    
    mkdir -p workspace/demo-case
    
    # Create a demo case.json
    cat > workspace/demo-case/case.json << EOF
{
  "id": "demo-case",
  "step": "upload",
  "video_path": "demo.mov",
  "created_at": "$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")",
  "updated_at": "$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")"
}
EOF

    print_success "Workspace directory created"
}

# Check if demo video exists
check_demo_video() {
    print_status "Checking for demo video..."
    
    if [ -f "workspace/demo-case/demo.mov" ]; then
        print_success "Demo video found"
    else
        print_warning "Demo video not found at workspace/demo-case/demo.mov"
        echo "You can:"
        echo "  1. Copy your own video file to workspace/demo-case/demo.mov"
        echo "  2. Use any video file with the CLI: npm run temporal:track your-video.mp4"
    fi
}

# Start Temporal server
start_temporal_server() {
    print_status "Starting Temporal development server..."
    
    if pgrep -f "temporal server start-dev" > /dev/null; then
        print_warning "Temporal server appears to be already running"
    else
        echo "Starting Temporal server in the background..."
        nohup temporal server start-dev > temporal-server.log 2>&1 &
        
        # Wait a moment for server to start
        sleep 3
        
        if pgrep -f "temporal server start-dev" > /dev/null; then
            print_success "Temporal server started successfully"
            echo "  - Web UI: http://localhost:8233"
            echo "  - Server: localhost:7233"
            echo "  - Logs: temporal-server.log"
        else
            print_error "Failed to start Temporal server"
            echo "Check temporal-server.log for details"
            return 1
        fi
    fi
}

# Display next steps
show_next_steps() {
    echo ""
    echo "🎉 Setup complete! Next steps:"
    echo ""
    echo "1. Start the Temporal worker:"
    echo "   npm run temporal:worker"
    echo ""
    echo "2. In another terminal, run video tracking:"
    echo "   npm run temporal:track                    # Process demo.mov"
    echo "   npm run temporal:track --demo             # Demo mode"
    echo "   npm run temporal:track your-video.mp4     # Process specific video"
    echo ""
    echo "3. Or run everything together:"
    echo "   npm run temporal:dev                      # Worker + Next.js dev server"
    echo ""
    echo "4. Monitor workflows:"
    echo "   Open http://localhost:8233 in your browser"
    echo ""
    echo "📚 Documentation:"
    echo "   - Temporal README: temporal/README.md"
    echo "   - CLI help: npm run temporal:track -- --help"
    echo ""
}

# Main setup function
main() {
    echo "Starting setup process..."
    echo ""
    
    # Run setup steps
    check_temporal_cli || {
        print_error "Please install Temporal CLI first"
        exit 1
    }
    
    install_dependencies || {
        print_error "Failed to install dependencies"
        exit 1
    }
    
    setup_workspace
    check_demo_video
    
    # Ask if user wants to start Temporal server
    echo ""
    read -p "Start Temporal development server now? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        start_temporal_server || {
            print_warning "Temporal server failed to start, but you can start it manually with: temporal server start-dev"
        }
    else
        print_status "Skipping Temporal server startup"
        echo "You can start it later with: temporal server start-dev"
    fi
    
    show_next_steps
}

# Run main function
main "$@"
