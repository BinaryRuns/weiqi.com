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
fps_csv=$(IFS=,; echo "${current_fps[*]}")
echo "🔧 Setting .sops.yaml pgp to: $fps_csv"
yq e -i '.creation_rules[0].pgp = "'"$fps_csv"'"' .sops.yaml

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
