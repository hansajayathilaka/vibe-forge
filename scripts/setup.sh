#!/usr/bin/env bash
set -euo pipefail

# ---------------------------------------------------------------------------
# VibeForge setup script
# Downloads the PocketBase binary and wires up hook files.
# ---------------------------------------------------------------------------

PB_VERSION="0.22.25"
BACKEND_DIR="$(cd "$(dirname "$0")/../backend" && pwd)"
APP_HOOKS_DIR="$(cd "$(dirname "$0")/../app/hooks" && pwd)"

# Detect OS + architecture
OS="$(uname -s)"
ARCH="$(uname -m)"
IS_WINDOWS=false

case "$OS" in
  Linux)
    case "$ARCH" in
      x86_64)  PB_PLATFORM="linux_amd64" ;;
      aarch64) PB_PLATFORM="linux_arm64" ;;
      *)        echo "Unsupported Linux arch: $ARCH" && exit 1 ;;
    esac
    PB_BINARY="$BACKEND_DIR/pocketbase"
    ;;
  Darwin)
    case "$ARCH" in
      x86_64)  PB_PLATFORM="darwin_amd64" ;;
      arm64)   PB_PLATFORM="darwin_arm64" ;;
      *)        echo "Unsupported macOS arch: $ARCH" && exit 1 ;;
    esac
    PB_BINARY="$BACKEND_DIR/pocketbase"
    ;;
  MINGW*|CYGWIN*|MSYS*)
    IS_WINDOWS=true
    case "$ARCH" in
      x86_64)  PB_PLATFORM="windows_amd64" ;;
      aarch64) PB_PLATFORM="windows_arm64" ;;
      *)        echo "Unsupported Windows arch: $ARCH" && exit 1 ;;
    esac
    PB_BINARY="$BACKEND_DIR/pocketbase.exe"
    ;;
  *)
    echo "Unsupported OS: $OS" && exit 1
    ;;
esac

# Download PocketBase if not already present
if [ ! -f "$PB_BINARY" ]; then
  echo "Downloading PocketBase v${PB_VERSION} for ${PB_PLATFORM}…"
  PB_URL="https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_${PB_PLATFORM}.zip"
  TMP_ZIP="$(mktemp /tmp/pocketbase-XXXXXX.zip)"
  curl -fsSL "$PB_URL" -o "$TMP_ZIP"
  if [ "$IS_WINDOWS" = true ]; then
    unzip -o "$TMP_ZIP" pocketbase.exe -d "$BACKEND_DIR"
  else
    unzip -o "$TMP_ZIP" pocketbase -d "$BACKEND_DIR"
    chmod +x "$PB_BINARY"
  fi
  rm "$TMP_ZIP"
  echo "PocketBase downloaded → $PB_BINARY"
else
  echo "PocketBase already present at $PB_BINARY — skipping download."
fi

# Copy app/hooks/ → backend/pb_hooks/
# A comment is prepended to each file because hook changes require a PocketBase restart.
PB_HOOKS_DIR="$BACKEND_DIR/pb_hooks"
mkdir -p "$PB_HOOKS_DIR"

if compgen -G "$APP_HOOKS_DIR/*.pb.js" > /dev/null 2>&1; then
  echo "Copying hook files → backend/pb_hooks/"
  for hook_file in "$APP_HOOKS_DIR"/*.pb.js; do
    filename="$(basename "$hook_file")"
    {
      echo "// NOTE: This file was copied from app/hooks/ by scripts/setup.sh."
      echo "// Changes to hook files require a PocketBase restart to take effect."
      echo "// Edit the source file in app/hooks/ and re-run 'pnpm setup'."
      echo ""
      cat "$hook_file"
    } > "$PB_HOOKS_DIR/$filename"
  done
  echo "Done."
else
  echo "No hook files found in app/hooks/ — skipping."
fi

echo ""
echo "Setup complete. Run 'pnpm dev' to start the development servers."
