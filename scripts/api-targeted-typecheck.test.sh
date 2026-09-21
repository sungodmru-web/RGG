#!/usr/bin/env bash

set -u

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_ZOD_DIR="$ROOT_DIR/lib/api-zod"
DIST_DIR="$API_ZOD_DIR/dist"
BUILD_INFO="$API_ZOD_DIR/tsconfig.tsbuildinfo"
TYPECHECK=(pnpm --filter @workspace/api-server run typecheck)
TEMP_DIR="$(mktemp -d)"

dist_existed=0
build_info_existed=0

if [[ -d "$DIST_DIR" ]]; then
  dist_existed=1
  cp -a "$DIST_DIR" "$TEMP_DIR/dist"
fi

if [[ -f "$BUILD_INFO" ]]; then
  build_info_existed=1
  cp -a "$BUILD_INFO" "$TEMP_DIR/tsconfig.tsbuildinfo"
fi

restore_generated_files() {
  rm -rf "$DIST_DIR"
  rm -f "$BUILD_INFO"

  if [[ "$dist_existed" -eq 1 ]]; then
    cp -a "$TEMP_DIR/dist" "$DIST_DIR"
  fi

  if [[ "$build_info_existed" -eq 1 ]]; then
    cp -a "$TEMP_DIR/tsconfig.tsbuildinfo" "$BUILD_INFO"
  fi

  rm -rf "$TEMP_DIR"
}

trap restore_generated_files EXIT INT TERM

run_typecheck() {
  local output_file="$1"
  set +e
  (
    cd "$ROOT_DIR"
    "${TYPECHECK[@]}"
  ) >"$output_file" 2>&1
  local status=$?
  set -e
  return "$status"
}

set -e

clean_status=0
run_typecheck "$TEMP_DIR/clean.log" || clean_status=$?

if [[ "$clean_status" -ne 0 ]]; then
  echo "Clean targeted API type-check failed:" >&2
  cat "$TEMP_DIR/clean.log" >&2
  exit "$clean_status"
fi

mkdir -p "$DIST_DIR"
stale_marker="STALE_DECLARATION_MUST_BE_REBUILT"
printf 'export declare const %s: ;\n' "$stale_marker" >"$DIST_DIR/index.d.ts"

stale_status=0
run_typecheck "$TEMP_DIR/stale.log" || stale_status=$?

if [[ "$stale_status" -ne "$clean_status" ]]; then
  echo "Targeted API type-check result changed when declaration output was stale." >&2
  echo "--- clean run ---" >&2
  cat "$TEMP_DIR/clean.log" >&2
  echo "--- stale run ---" >&2
  cat "$TEMP_DIR/stale.log" >&2
  exit 1
fi

if grep -R -q "$stale_marker" "$DIST_DIR"; then
  echo "Targeted API type-check did not replace the stale declaration output." >&2
  exit 1
fi

echo "Targeted API type-check rebuilt stale shared declarations successfully."