#!/usr/bin/env bash
set -euo pipefail

# 1) Make globs vanish if they don’t match
shopt -s nullglob

# 2) Gather current .asc fingerprints
declare -a current_fps=()
for pub in keys/*.asc; do
  fp=$(gpg --with-colons --import-options show-only --import "$pub" \
       | awk -F: '/^fpr:/ {print $10; exit}')
  if [[ -n "$fp" ]]; then
    current_fps+=("$fp")
  else
    echo "⚠️ Could not extract fingerprint from $pub; skipping."
  fi
done

# 3) Load existing fingerprints from .sops.yaml
mapfile -t existing_fps < <(
  yq e '.creation_rules[0].pgp[]' .sops.yaml
)

# 4) Prune removed keys from .sops.yaml
for old in "${existing_fps[@]}"; do
  if ! printf '%s\n' "${current_fps[@]}" | grep -Fxq "$old"; then
    echo "🗑️ Removing stale fingerprint $old from .sops.yaml"
    yq e -i '
      .creation_rules[0].pgp |=
      map(select(. != "'"$old"'"))
    ' .sops.yaml
  fi
done

# 5) Add any new keys to .sops.yaml
for fp in "${current_fps[@]}"; do
  if ! printf '%s\n' "${existing_fps[@]}" | grep -Fxq "$fp"; then
    echo "➕ Adding new fingerprint $fp to .sops.yaml"
    yq e -i '
      .creation_rules[0].pgp += ["'"$fp"'"]
    ' .sops.yaml
  fi
done

# 6) Rotate all .env.enc files (recursively)
mapfile -t env_files < <(find . -type f -name '.env.enc')
if [ ${#env_files[@]} -eq 0 ]; then
  echo "⚠️ No .env.enc files found—nothing to re-encrypt."
  exit 0
fi

for file in "${env_files[@]}"; do
  echo "🔄 Rotating recipients on $file"
  for fp in "${current_fps[@]}"; do
    sops --input-type dotenv --output-type dotenv -i \
         --rotate --add-pgp "$fp" "$file"
  done
done

echo "✅ Update complete."
