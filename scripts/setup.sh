#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

for tool in node npm git; do
  command -v "$tool" >/dev/null 2>&1 || { echo "Missing $tool. Install Node.js 24 (with npm) and Git first." >&2; exit 1; }
done
node -e 'if (Number(process.versions.node.split(".")[0]) < 22) { console.error("Node.js 22+ required; Node.js 24 recommended (.nvmrc)."); process.exit(1) }'

# Git LFS is only needed for the design reference images, not the app build.
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  if git lfs version >/dev/null 2>&1; then
    git lfs install --local
    git lfs pull
  else
    echo "Git LFS is missing; design images may remain pointers. See README for installation."
  fi
fi

npm ci
if [[ ! -e .env.local ]]; then
  cp .env.example .env.local
  echo "Created .env.local with empty settings (demo mode)."
fi
npm run build
echo "Setup complete. Run npm run dev to start the app."
