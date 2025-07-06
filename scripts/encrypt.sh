# Grab all fingerprints from keys/*.asc
FPS=$(for pub in keys/*.asc; do
  gpg --with-colons --import-options show-only --import "$pub" \
    | awk -F: '/^fpr:/ {print $10; exit}'
done)

# Encrypt each .env → .env.enc
find . -type f \( -name ".env" -o -name ".env.local" -o -name ".env.production" -o -name ".env.production.local" \) | while read -r ENV; do  OUT="${ENV}.enc"
  echo "🔒 Encrypting $ENV → $OUT"
  sops --encrypt --input-type dotenv --output-type dotenv \
    $(printf -- '--pgp %s ' $FPS) \
    "$ENV" > "$OUT"
done
