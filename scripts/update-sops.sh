#!/usr/bin/env bash
set -euxo pipefail

# rebuild .sops.yaml
cat > .sops.yaml <<'EOF'
creation_rules:
  - path_regex: \.env$
    encrypted_regex: '^(?!#).*'
    pgp:
EOF

for pub in keys/*.asc; do
  # show-only import so GPG doesn’t actually store it
  fp=$(gpg --with-colons \
           --import-options show-only \
           --import "$pub" \
        | awk -F: '/^fpr:/ { print $10; exit }')
  echo "      - \"$fp\"" >> .sops.yaml
done

# re-encrypt
sops --input-type dotenv --output-type dotenv --encrypt .env > .env.enc
