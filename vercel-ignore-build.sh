#!/bin/bash

echo "VERCEL_GIT_COMMIT_REF: $VERCEL_GIT_COMMIT_REF"

if [[ "$VERCEL_GIT_COMMIT_REF" == "main" ]]; then
  # Proceed with the build for main branch
  echo "✅ - Build can proceed (main branch)"
  exit 1;
else
  # Skip the build for any other branch
  echo "🛑 - Build cancelled (not main branch)"
  exit 0;
fi
