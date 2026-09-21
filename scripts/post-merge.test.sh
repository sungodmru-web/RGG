#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
temporary_directory="$(mktemp -d)"
trap 'rm -rf "$temporary_directory"' EXIT

cat >"$temporary_directory/pnpm" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
printf '%s\n' "$*" >>"$PNPM_CALL_LOG"
if [[ "$*" == *"migration:migrate"* && "${FAIL_MIGRATION:-0}" == "1" ]]; then
  exit 42
fi
EOF
chmod +x "$temporary_directory/pnpm"

export PATH="$temporary_directory:$PATH"
export PNPM_CALL_LOG="$temporary_directory/pnpm-calls.log"

: >"$PNPM_CALL_LOG"
bash "$project_root/scripts/post-merge.sh"
grep -Fxq "install --frozen-lockfile" "$PNPM_CALL_LOG"
grep -Fxq -- "--filter @workspace/db run migration:migrate" "$PNPM_CALL_LOG"

: >"$PNPM_CALL_LOG"
if FAIL_MIGRATION=1 bash "$project_root/scripts/post-merge.sh"; then
  echo "post-merge setup unexpectedly ignored migration failure" >&2
  exit 1
fi
grep -Fxq -- "--filter @workspace/db run migration:migrate" "$PNPM_CALL_LOG"

echo "post-merge success and migration failure paths verified"