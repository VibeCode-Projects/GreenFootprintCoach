#!/usr/bin/env bash

# ==============================================================================
# AI-Powered Eco-Habit & Green Footprint Coach
# Automation Management Script (Start, Stop, Status, Push)
# ==============================================================================

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$PROJECT_ROOT/server"
CLIENT_DIR="$PROJECT_ROOT/client"

SERVER_PORT=5001
CLIENT_PORT=5173

SERVER_PID_FILE="$PROJECT_ROOT/.server.pid"
CLIENT_PID_FILE="$PROJECT_ROOT/.client.pid"

SERVER_LOG="$PROJECT_ROOT/server.log"
CLIENT_LOG="$PROJECT_ROOT/client.log"

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

function print_banner() {
  echo -e "${GREEN}====================================================================${NC}"
  echo -e "${GREEN}   🌿 AI-Powered Eco-Habit & Green Footprint Coach Management       ${NC}"
  echo -e "${GREEN}====================================================================${NC}"
}

function setup_env() {
  echo -e "${BLUE}[Setup] Checking environment configuration...${NC}"
  if [ ! -f "$SERVER_DIR/.env" ]; then
    if [ -f "$PROJECT_ROOT/.env.example" ]; then
      cp "$PROJECT_ROOT/.env.example" "$SERVER_DIR/.env"
      echo -e "${GREEN}[Setup] Created server/.env from .env.example${NC}"
    fi
  else
    echo -e "${GREEN}[Setup] server/.env already exists.${NC}"
  fi

  echo -e "${BLUE}[Setup] Checking and installing dependencies...${NC}"
  if [ ! -d "$SERVER_DIR/node_modules" ]; then
    echo -e "${YELLOW}[Setup] Installing server dependencies...${NC}"
    (cd "$SERVER_DIR" && npm install)
  fi

  if [ ! -d "$CLIENT_DIR/node_modules" ]; then
    echo -e "${YELLOW}[Setup] Installing client dependencies...${NC}"
    (cd "$CLIENT_DIR" && npm install)
  fi
  echo -e "${GREEN}[Setup] Setup complete!${NC}"
}

function start_services() {
  print_banner
  setup_env

  # Check if backend is already running
  if lsof -i :$SERVER_PORT -t >/dev/null 2>&1; then
    echo -e "${YELLOW}[Server] Process already running on port $SERVER_PORT.${NC}"
  else
    echo -e "${BLUE}[Server] Starting Express backend on port $SERVER_PORT...${NC}"
    nohup node "$SERVER_DIR/server.js" > "$SERVER_LOG" 2>&1 &
    echo $! > "$SERVER_PID_FILE"
    sleep 2
    if lsof -i :$SERVER_PORT -t >/dev/null 2>&1; then
      echo -e "${GREEN}[Server] Backend running successfully at: http://localhost:$SERVER_PORT${NC}"
    else
      echo -e "${RED}[Server] Backend failed to start. Check $SERVER_LOG for errors.${NC}"
    fi
  fi

  # Check if client is already running
  if lsof -i :$CLIENT_PORT -t >/dev/null 2>&1; then
    echo -e "${YELLOW}[Client] Process already running on port $CLIENT_PORT.${NC}"
  else
    echo -e "${BLUE}[Client] Starting Vite frontend on port $CLIENT_PORT...${NC}"
    (cd "$CLIENT_DIR" && nohup npx vite --host 0.0.0.0 --port $CLIENT_PORT > "$CLIENT_LOG" 2>&1 & echo $! > "$CLIENT_PID_FILE")
    sleep 2
    if lsof -i :$CLIENT_PORT -t >/dev/null 2>&1; then
      echo -e "${GREEN}[Client] Frontend running successfully at: http://localhost:$CLIENT_PORT${NC}"
    else
      echo -e "${RED}[Client] Frontend failed to start. Check $CLIENT_LOG for errors.${NC}"
    fi
  fi

  echo ""
  echo -e "${GREEN}✨ Application URLs:${NC}"
  echo -e "   • Frontend: ${BLUE}http://localhost:$CLIENT_PORT${NC}"
  echo -e "   • Backend:  ${BLUE}http://localhost:$SERVER_PORT/api/health${NC}"
  echo -e "   • Demo User: ${YELLOW}test@ecocoach.com${NC} / Password: ${YELLOW}password123${NC}"
  echo ""
}

function stop_services() {
  print_banner
  echo -e "${YELLOW}[Stop] Stopping backend and frontend processes...${NC}"

  # Stop by recorded PID
  if [ -f "$SERVER_PID_FILE" ]; then
    kill $(cat "$SERVER_PID_FILE") 2>/dev/null || true
    rm -f "$SERVER_PID_FILE"
  fi

  if [ -f "$CLIENT_PID_FILE" ]; then
    kill $(cat "$CLIENT_PID_FILE") 2>/dev/null || true
    rm -f "$CLIENT_PID_FILE"
  fi

  # Stop by port if still listening
  SERVER_PID=$(lsof -ti :$SERVER_PORT 2>/dev/null || true)
  if [ -n "$SERVER_PID" ]; then
    echo -e "${YELLOW}[Stop] Killing process on port $SERVER_PORT (PID: $SERVER_PID)...${NC}"
    kill -9 $SERVER_PID 2>/dev/null || true
  fi

  CLIENT_PID=$(lsof -ti :$CLIENT_PORT 2>/dev/null || true)
  if [ -n "$CLIENT_PID" ]; then
    echo -e "${YELLOW}[Stop] Killing process on port $CLIENT_PORT (PID: $CLIENT_PID)...${NC}"
    kill -9 $CLIENT_PID 2>/dev/null || true
  fi

  echo -e "${GREEN}[Stop] All application services stopped.${NC}"
}

function check_status() {
  print_banner
  echo -e "${BLUE}[Status] Checking Eco-Habit Coach services:${NC}"
  echo ""

  SERVER_PID=$(lsof -ti :$SERVER_PORT 2>/dev/null || true)
  if [ -n "$SERVER_PID" ]; then
    echo -e "  • Backend (port $SERVER_PORT):  ${GREEN}RUNNING${NC} (PID: $SERVER_PID)"
  else
    echo -e "  • Backend (port $SERVER_PORT):  ${RED}STOPPED${NC}"
  fi

  CLIENT_PID=$(lsof -ti :$CLIENT_PORT 2>/dev/null || true)
  if [ -n "$CLIENT_PID" ]; then
    echo -e "  • Frontend (port $CLIENT_PORT): ${GREEN}RUNNING${NC} (PID: $CLIENT_PID)"
  else
    echo -e "  • Frontend (port $CLIENT_PORT): ${RED}STOPPED${NC}"
  fi
  echo ""
}

function push_code() {
  print_banner
  COMMIT_MSG="${1:-Update application code and project deliverables}"

  echo -e "${BLUE}[Git] Staging changes...${NC}"
  git add .

  echo -e "${BLUE}[Git] Creating commit with message: \"$COMMIT_MSG\"...${NC}"
  git commit -m "$COMMIT_MSG" || echo -e "${YELLOW}[Git] No new changes to commit.${NC}"

  echo -e "${BLUE}[Git] Pushing to origin main...${NC}"
  git push origin main
  echo -e "${GREEN}[Git] Code pushed successfully to GitHub!${NC}"
}

# Command dispatching
case "$1" in
  start)
    start_services
    ;;
  stop)
    stop_services
    ;;
  restart)
    stop_services
    sleep 1
    start_services
    ;;
  status)
    check_status
    ;;
  setup)
    setup_env
    ;;
  push)
    shift
    push_code "$*"
    ;;
  *)
    print_banner
    echo "Usage: ./manage.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start           Start both Backend (port 5001) and Frontend (port 5173)"
    echo "  stop            Stop both running services"
    echo "  restart         Restart both services"
    echo "  status          Check running status of both services"
    echo "  setup           Install dependencies and copy .env.example"
    echo "  push [message]  Stage, commit, and push changes to GitHub"
    echo ""
    echo "Examples:"
    echo "  ./manage.sh start"
    echo "  ./manage.sh status"
    echo "  ./manage.sh push \"Added new feature\""
    echo ""
    ;;
esac
