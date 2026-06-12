#!/usr/bin/env bash
# Run database setup using Linux Node (avoids Windows npm/CMD issues in WSL).
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ "$(npm config get script-shell 2>/dev/null || true)" == *"cmd"* ]] || npm --version 2>/dev/null | grep -q "CMD"; then
  echo "Warning: Windows npm detected. Install Linux Node first (see README)."
fi

if command -v node >/dev/null && [[ "$(which node)" == /mnt/c/* ]]; then
  echo "Error: Windows Node detected at $(which node)"
  echo "Install Linux Node in WSL, then re-run this script."
  echo "  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.2/install.sh | bash"
  echo "  source ~/.bashrc && nvm install 22"
  exit 1
fi

if ! command -v node >/dev/null; then
  echo "Error: node not found. Install Node.js 20+ inside WSL/Kali."
  exit 1
fi

echo "Using node: $(which node) ($(node -v))"
echo "Using npm:  $(which npm) ($(npm -v))"

node ./node_modules/prisma/build/index.js db push
node ./node_modules/prisma/build/index.js db seed

echo "Done. Run: npm run dev"
