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

case "$OS" in
  Linux)
    case "$ARCH" in
      x86_64)  PB_PLATFORM="linux_amd64" ;;
      aarch64) PB_PLATFORM="linux_arm64" ;;
      *)        echo "Unsupported Linux arch: $ARCH" && exit 1 ;;
    esac
    ;;
  Darwin)
    case "$ARCH" in
      x86_64)  PB_PLATFORM="darwin_amd64" ;;
      arm64)   PB_PLATFORM="darwin_arm64" ;;
      *)        echo "Unsupported macOS arch: $ARCH" && exit 1 ;;
    esac
    ;;
  *)
    echo "Unsupported OS: $OS" && exit 1
    ;;
esac

PB_BINARY="$BACKEND_DIR/pocketbase"

# Download PocketBase if not already present
if [ ! -f "$PB_BINARY" ]; then
  echo "Downloading PocketBase v${PB_VERSION} for ${PB_PLATFORM}…"
  PB_URL="https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_${PB_PLATFORM}.zip"
  TMP_ZIP="$(mktemp /tmp/pocketbase-XXXXXX.zip)"
  curl -fsSL "$PB_URL" -o "$TMP_ZIP"
  unzip -o "$TMP_ZIP" pocketbase -d "$BACKEND_DIR"
  rm "$TMP_ZIP"
  chmod +x "$PB_BINARY"
  echo "PocketBase downloaded → $PB_BINARY"
else
  echo "PocketBase already present at $PB_BINARY — skipping download."
fi

# Copy app/hooks/ → backend/pb_hooks/
PB_HOOKS_DIR="$BACKEND_DIR/pb_hooks"
mkdir -p "$PB_HOOKS_DIR"

if compgen -G "$APP_HOOKS_DIR/*.pb.js" > /dev/null 2>&1; then
  echo "Copying hook files → backend/pb_hooks/"
  cp "$APP_HOOKS_DIR"/*.pb.js "$PB_HOOKS_DIR/"
  echo "Done."
else
  echo "No hook files found in app/hooks/ — skipping."
fi

echo ""
echo "Setup complete. Run 'pnpm dev' to start the development servers."
