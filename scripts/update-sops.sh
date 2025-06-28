set -euo pipefail

# find every .env.enc under the repo
mapfile -t env_files < <(find . -type f -name ".env.enc")

if [ ${#env_files[@]} -eq 0 ]; then
  echo "⚠️  No .env.enc files found; skipping rotation."
  exit 0
fi

# gather fingerprints as before…
pub_keys=(keys/*.asc)
declare -a fps=()
for pub in "${pub_keys[@]}"; do
  fp=$(gpg --with-colons --import-options show-only --import "$pub" \
       | awk -F: '/^fpr:/ {print $10; exit}')
  fps+=("$fp")
done

# now rotate each encrypted file
for file in "${env_files[@]}"; do
  echo "🔄 Rotating recipients on $file"
  for fp in "${fps[@]}"; do
    sops --input-type dotenv --output-type dotenv -i \
         --rotate --add-pgp "$fp" "$file"
  done
done

echo "✅ Rotation complete on ${#env_files[@]} file(s)."