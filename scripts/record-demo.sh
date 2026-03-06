#!/bin/bash
#
# Medica — Native macOS Demo Recording Script
#
# This script physically controls your mouse & keyboard to create a smooth
# product demo. Use macOS screen recording (⌘⇧5) or OBS to capture it.
#
# Prerequisites:
#   1. brew install cliclick
#   2. Grant Terminal/iTerm accessibility permissions:
#      System Settings → Privacy & Security → Accessibility → add your terminal
#   3. App running: php artisan serve + npm run dev
#   4. Open Chrome/Safari to http://localhost:8000 full-screen
#   5. Start screen recording FIRST, then run this script
#
# Usage:
#   chmod +x scripts/record-demo.sh
#   ./scripts/record-demo.sh
#

set -e

# ─── Configuration ──────────────────────────────────────────
BASE_URL="http://localhost:8000"
# Screen center (for Retina 2560x1664, logical is 1280x832)
SCREEN_W=1280
SCREEN_H=832
CENTER_X=$((SCREEN_W / 2))
CENTER_Y=$((SCREEN_H / 2))

# Speeds
MOUSE_STEPS=30        # Steps for smooth mouse move (higher = smoother)
MOUSE_DELAY=0.012     # Delay between mouse steps (seconds)
TYPE_DELAY=0.06       # Delay between keystrokes
PAUSE_SHORT=0.5
PAUSE_MED=1.2
PAUSE_LONG=2.5
PAUSE_XLNG=3.5

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ─── Helper Functions ───────────────────────────────────────

log() {
  echo -e "${GREEN}▶${NC} $1"
}

section() {
  echo ""
  echo -e "${BLUE}══════════════════════════════════════════════${NC}"
  echo -e "${YELLOW}  $1${NC}"
  echo -e "${BLUE}══════════════════════════════════════════════${NC}"
}

pause() {
  sleep "${1:-$PAUSE_MED}"
}

# Smooth mouse move with easing (cubic ease-in-out)
smooth_move() {
  local target_x=$1
  local target_y=$2
  local steps=${3:-$MOUSE_STEPS}

  # Get current mouse position
  local current
  current=$(cliclick p 2>/dev/null || echo "640,400")
  local cur_x cur_y
  cur_x=$(echo "$current" | cut -d',' -f1 | tr -d ' ')
  cur_y=$(echo "$current" | cut -d',' -f2 | tr -d ' ')

  for ((i = 0; i <= steps; i++)); do
    local t
    t=$(echo "scale=6; $i / $steps" | bc)
    # Cubic ease-in-out
    local ease
    ease=$(echo "scale=6; if ($t < 0.5) 4*$t*$t*$t else 1 - (-2*$t+2)^3/2" | bc 2>/dev/null || echo "$t")
    local x y
    x=$(echo "scale=0; $cur_x + ($target_x - $cur_x) * $ease / 1" | bc)
    y=$(echo "scale=0; $cur_y + ($target_y - $cur_y) * $ease / 1" | bc)
    cliclick m:"$x","$y" 2>/dev/null
    sleep "$MOUSE_DELAY"
  done
}

# Click at position with smooth move first
smooth_click() {
  local x=$1
  local y=$2
  smooth_move "$x" "$y"
  sleep 0.15
  cliclick c:"$x","$y" 2>/dev/null
}

# Type text character by character (uses osascript for real keystrokes)
slow_type() {
  local text="$1"
  local delay="${2:-$TYPE_DELAY}"
  for ((i = 0; i < ${#text}; i++)); do
    local char="${text:$i:1}"
    # Escape special characters for AppleScript
    if [[ "$char" == '"' ]]; then
      osascript -e 'tell application "System Events" to keystroke "\""' 2>/dev/null
    elif [[ "$char" == '\\' ]]; then
      osascript -e 'tell application "System Events" to keystroke "\\"' 2>/dev/null
    else
      osascript -e "tell application \"System Events\" to keystroke \"$char\"" 2>/dev/null
    fi
    sleep "$delay"
  done
}

# Press a key (return, tab, escape, etc.)
press_key() {
  local key="$1"
  case "$key" in
    return|enter)
      osascript -e 'tell application "System Events" to key code 36' 2>/dev/null ;;
    tab)
      osascript -e 'tell application "System Events" to key code 48' 2>/dev/null ;;
    escape|esc)
      osascript -e 'tell application "System Events" to key code 53' 2>/dev/null ;;
    space)
      osascript -e 'tell application "System Events" to key code 49' 2>/dev/null ;;
    delete|backspace)
      osascript -e 'tell application "System Events" to key code 51' 2>/dev/null ;;
    down)
      osascript -e 'tell application "System Events" to key code 125' 2>/dev/null ;;
    up)
      osascript -e 'tell application "System Events" to key code 126' 2>/dev/null ;;
  esac
}

# Cmd+key shortcut
cmd_key() {
  osascript -e "tell application \"System Events\" to keystroke \"$1\" using command down" 2>/dev/null
}

# Navigate to a URL via the address bar
navigate() {
  local url="$1"
  log "Navigating to $url"
  cmd_key "l"       # Focus address bar
  sleep 0.3
  cmd_key "a"       # Select all
  sleep 0.1
  slow_type "$url" 0.03
  sleep 0.2
  press_key return
  sleep "$PAUSE_LONG"
}

# Scroll down smoothly
scroll_down() {
  local amount="${1:-5}"
  for ((i = 0; i < amount; i++)); do
    osascript -e 'tell application "System Events" to key code 125' 2>/dev/null
    sleep 0.08
  done
  sleep "$PAUSE_SHORT"
}

# Scroll up smoothly
scroll_up() {
  local amount="${1:-5}"
  for ((i = 0; i < amount; i++)); do
    osascript -e 'tell application "System Events" to key code 126' 2>/dev/null
    sleep 0.08
  done
  sleep "$PAUSE_SHORT"
}

# Scroll to top
scroll_top() {
  cmd_key ""
  osascript -e 'tell application "System Events" to key code 126 using command down' 2>/dev/null
  sleep "$PAUSE_SHORT"
}

# Scroll to bottom
scroll_bottom() {
  osascript -e 'tell application "System Events" to key code 125 using command down' 2>/dev/null
  sleep "$PAUSE_SHORT"
}

# Wave the mouse in a gentle arc (draws attention)
mouse_wave() {
  local cx=${1:-$CENTER_X}
  local cy=${2:-$CENTER_Y}
  local radius=${3:-80}
  for ((i = 0; i <= 20; i++)); do
    local angle
    angle=$(echo "scale=6; 3.14159 * $i / 10" | bc)
    local x y
    x=$(echo "scale=0; $cx + $radius * s($angle) / 1" | bc -l)
    y=$(echo "scale=0; $cy + $radius * c($angle) / 2 / 1" | bc -l)
    cliclick m:"$x","$y" 2>/dev/null
    sleep 0.025
  done
}

# ─── Pre-flight checks ─────────────────────────────────────

echo ""
echo -e "${YELLOW}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║          🎬 Medica Demo Recording Script         ║${NC}"
echo -e "${YELLOW}╚══════════════════════════════════════════════════╝${NC}"
echo ""

# Check cliclick
if ! command -v cliclick &>/dev/null; then
  echo -e "${RED}✗ cliclick not found. Install with: brew install cliclick${NC}"
  exit 1
fi

echo -e "${GREEN}✓${NC} cliclick found"
echo -e "${GREEN}✓${NC} Screen: ${SCREEN_W}x${SCREEN_H} (logical)"
echo ""
echo -e "${YELLOW}Instructions:${NC}"
echo "  1. Open Chrome to ${BASE_URL} (full screen recommended)"
echo "  2. Start screen recording (⌘⇧5 → Record Entire Screen)"
echo "  3. Press ENTER here to begin the demo"
echo ""
echo -e "${RED}⚠  Don't touch the mouse/keyboard during recording!${NC}"
echo ""
read -rp "Press ENTER to start in 3 seconds..."
sleep 1
echo "3..."
sleep 1
echo "2..."
sleep 1
echo "1..."
sleep 1
echo -e "${GREEN}🎬 Recording!${NC}"

# ═══════════════════════════════════════════════════════════════
# SCENE 1: LANDING PAGE
# ═══════════════════════════════════════════════════════════════
section "1/12 • Landing Page"

navigate "${BASE_URL}"
pause "$PAUSE_XLNG"

# Hover the hero text
log "Hovering hero section..."
smooth_move 400 300
pause "$PAUSE_MED"

# Hover the "Start free" button
smooth_move 380 470
pause "$PAUSE_SHORT"

# Hover "Watch the demo" button
smooth_move 540 470
pause "$PAUSE_SHORT"

# Scroll through features
log "Scrolling features..."
scroll_down 15
pause "$PAUSE_MED"
scroll_down 15
pause "$PAUSE_MED"

# Scroll to demo video
scroll_down 10
pause "$PAUSE_LONG"

# Scroll to CTA
scroll_down 15
pause "$PAUSE_MED"

# Back to top
scroll_top
pause "$PAUSE_MED"

# ═══════════════════════════════════════════════════════════════
# SCENE 2: LOGIN
# ═══════════════════════════════════════════════════════════════
section "2/12 • Login"

navigate "${BASE_URL}/login"
pause "$PAUSE_LONG"

# Click email field (roughly center-left of login form)
log "Typing credentials..."
smooth_click 640 360
pause "$PAUSE_SHORT"

# Clear and type email
cmd_key "a"
slow_type "manager@medica.test" 0.05
pause "$PAUSE_SHORT"

# Tab to password field
press_key tab
pause 0.3
slow_type "password" 0.07
pause "$PAUSE_MED"

# Move to submit button and click
log "Logging in..."
smooth_move 640 500
pause 0.3
smooth_click 640 500
pause "$PAUSE_XLNG"

# ═══════════════════════════════════════════════════════════════
# SCENE 3: DASHBOARD
# ═══════════════════════════════════════════════════════════════
section "3/12 • Dashboard"

# Wait for page load
pause "$PAUSE_LONG"

# Hover stat cards across the top
log "Touring stat cards..."
smooth_move 300 200
pause "$PAUSE_SHORT"
smooth_move 520 200
pause "$PAUSE_SHORT"
smooth_move 740 200
pause "$PAUSE_SHORT"
smooth_move 960 200
pause "$PAUSE_MED"

# Scroll to see charts
log "Scrolling charts..."
scroll_down 10
pause "$PAUSE_LONG"
scroll_down 10
pause "$PAUSE_LONG"
scroll_top
pause "$PAUSE_MED"

# ═══════════════════════════════════════════════════════════════
# SCENE 4: VISITS
# ═══════════════════════════════════════════════════════════════
section "4/12 • Visits"

navigate "${BASE_URL}/visits"
pause "$PAUSE_LONG"

# Hover visit rows
log "Browsing visits..."
smooth_move 640 280
pause "$PAUSE_SHORT"
smooth_move 640 330
pause "$PAUSE_SHORT"
smooth_move 640 380
pause "$PAUSE_SHORT"
smooth_move 640 430
pause "$PAUSE_MED"

scroll_down 10
pause "$PAUSE_MED"
scroll_top
pause "$PAUSE_SHORT"

# ═══════════════════════════════════════════════════════════════
# SCENE 5: LOG A VISIT
# ═══════════════════════════════════════════════════════════════
section "5/12 • Visit Check-in Form"

navigate "${BASE_URL}/visits/create"
pause "$PAUSE_LONG"

# Move around the form
log "Exploring visit form..."
smooth_move 400 300
pause "$PAUSE_SHORT"

# Scroll to show time goal buttons
scroll_down 8
pause "$PAUSE_MED"

# Hover the time goal selector area
smooth_move 500 400
pause "$PAUSE_SHORT"
smooth_move 640 400
pause "$PAUSE_SHORT"
smooth_move 780 400
pause "$PAUSE_MED"

# Scroll to show efficiency preview
scroll_down 10
pause "$PAUSE_LONG"

# Hover the preview card
smooth_move 900 400
pause "$PAUSE_LONG"

scroll_top
pause "$PAUSE_SHORT"

# ═══════════════════════════════════════════════════════════════
# SCENE 6: DOCTORS
# ═══════════════════════════════════════════════════════════════
section "6/12 • Doctors"

navigate "${BASE_URL}/doctors"
pause "$PAUSE_LONG"

# Hover doctor list
log "Browsing doctors..."
smooth_move 300 300
pause "$PAUSE_SHORT"
smooth_move 300 360
pause "$PAUSE_SHORT"

# Click first doctor
smooth_click 300 300
pause "$PAUSE_LONG"

# Hover doctor detail panel
smooth_move 800 300
pause "$PAUSE_SHORT"
smooth_move 800 400
pause "$PAUSE_MED"

# Scroll doctor detail
scroll_down 10
pause "$PAUSE_MED"
scroll_down 10
pause "$PAUSE_MED"
scroll_top
pause "$PAUSE_SHORT"

# ═══════════════════════════════════════════════════════════════
# SCENE 7: OBJECTIVES
# ═══════════════════════════════════════════════════════════════
section "7/12 • Objectives"

navigate "${BASE_URL}/objectives"
pause "$PAUSE_LONG"

log "Browsing objectives..."
smooth_move 640 300
pause "$PAUSE_SHORT"
smooth_move 640 360
pause "$PAUSE_SHORT"
scroll_down 5
pause "$PAUSE_MED"
scroll_top
pause "$PAUSE_SHORT"

# ═══════════════════════════════════════════════════════════════
# SCENE 8: MEDICATIONS
# ═══════════════════════════════════════════════════════════════
section "8/12 • Medications"

navigate "${BASE_URL}/medications"
pause "$PAUSE_LONG"

log "Browsing medications..."
smooth_move 640 300
pause "$PAUSE_SHORT"
smooth_move 640 400
pause "$PAUSE_MED"
scroll_down 8
pause "$PAUSE_MED"
scroll_top
pause "$PAUSE_SHORT"

# ═══════════════════════════════════════════════════════════════
# SCENE 9: AI COACH
# ═══════════════════════════════════════════════════════════════
section "9/12 • AI Coach"

navigate "${BASE_URL}/ai-coach"
pause "$PAUSE_LONG"

# Click the chat input
log "Typing a question to AI..."
smooth_click 640 700
pause "$PAUSE_SHORT"

slow_type "What should I focus on this week to improve my scores?" 0.04
pause "$PAUSE_LONG"

# Don't submit — just show the typing
# Move mouse over the send button
smooth_move 1050 700
pause "$PAUSE_LONG"

# ═══════════════════════════════════════════════════════════════
# SCENE 10: NOTIFICATIONS
# ═══════════════════════════════════════════════════════════════
section "10/12 • Notifications"

navigate "${BASE_URL}/notifications"
pause "$PAUSE_LONG"

log "Browsing notifications..."
smooth_move 640 300
pause "$PAUSE_SHORT"
smooth_move 640 370
pause "$PAUSE_SHORT"
smooth_move 640 440
pause "$PAUSE_MED"
scroll_down 8
pause "$PAUSE_MED"
scroll_top
pause "$PAUSE_SHORT"

# ═══════════════════════════════════════════════════════════════
# SCENE 11: HELP
# ═══════════════════════════════════════════════════════════════
section "11/12 • Help & Documentation"

navigate "${BASE_URL}/help"
pause "$PAUSE_LONG"

log "Scrolling docs..."
scroll_down 10
pause "$PAUSE_MED"
scroll_down 10
pause "$PAUSE_MED"
scroll_down 10
pause "$PAUSE_MED"
scroll_top
pause "$PAUSE_SHORT"

# ═══════════════════════════════════════════════════════════════
# SCENE 12: ADMIN / DEV CONSOLE
# ═══════════════════════════════════════════════════════════════
section "12/12 • Dev Console"

navigate "${BASE_URL}/admin"
pause "$PAUSE_LONG"

# Overview — hover stats
log "Overview..."
smooth_move 400 250
pause "$PAUSE_SHORT"
smooth_move 700 250
pause "$PAUSE_MED"

# Click through tabs — they're in a horizontal bar near the top
# We'll click roughly where each tab would be
declare -a TAB_LABELS=("Users" "Flags" "Branding" "Themes" "Permissions" "System")
TAB_Y=345
TAB_START_X=350
TAB_SPACING=85

for i in "${!TAB_LABELS[@]}"; do
  local_x=$((TAB_START_X + i * TAB_SPACING))
  label="${TAB_LABELS[$i]}"
  log "Tab: $label"
  smooth_click "$local_x" "$TAB_Y"
  pause "$PAUSE_MED"
  scroll_down 5
  pause "$PAUSE_SHORT"
  scroll_top
  pause 0.3
done

# ═══════════════════════════════════════════════════════════════
# CLOSING: Back to Dashboard
# ═══════════════════════════════════════════════════════════════
section "Closing Shot"

navigate "${BASE_URL}/dashboard"
pause "$PAUSE_LONG"

# Gentle wave to close
mouse_wave "$CENTER_X" "$CENTER_Y" 60
pause "$PAUSE_XLNG"

# ═══════════════════════════════════════════════════════════════
# DONE
# ═══════════════════════════════════════════════════════════════
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║        ✅ Demo recording complete!                ║${NC}"
echo -e "${GREEN}║                                                  ║${NC}"
echo -e "${GREEN}║  Stop screen recording now (⌘⇧5 → Stop)        ║${NC}"
echo -e "${GREEN}║  Your video is saved to ~/Desktop or Movies     ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════╝${NC}"
echo ""
