#!/usr/bin/env bash
# Builds the "swordfight-rules" Ollama model: a base model with the full
# 2026 SoCal Swordfight ruleset baked in as its system prompt.
#
# Usage:
#   ./build-model.sh [base-model]
#
# base-model defaults to llama3.1:8b. On weaker hardware, try llama3.2:3b
# or llama3.2:1b instead (lower quality answers, much lighter to run).
set -euo pipefail

BASE_MODEL="${1:-llama3.1:8b}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MODELFILE="$(mktemp)"
trap 'rm -f "$MODELFILE"' EXIT

if ! command -v ollama >/dev/null 2>&1; then
  echo "Ollama isn't installed. Get it from https://ollama.com/download" >&2
  exit 1
fi

echo "Pulling base model: $BASE_MODEL"
ollama pull "$BASE_MODEL"

{
  echo "FROM $BASE_MODEL"
  echo "PARAMETER num_ctx 32768"
  echo "PARAMETER temperature 0.3"
  echo 'SYSTEM """'
  cat "$HERE/guardrail-preamble.txt"
  cat "$HERE/rules-full.txt"
  echo '"""'
} > "$MODELFILE"

echo "Building model 'swordfight-rules' from $MODELFILE"
ollama create swordfight-rules -f "$MODELFILE"

echo
echo "Done. Test it with: ollama run swordfight-rules"
echo "Or select 'swordfight-rules' as the model in Open WebUI."
