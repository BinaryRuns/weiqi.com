# SOPS Environment Management Guide

This guide explains how to use SOPS for managing environment variables in the Weiqi.com project.

## What is SOPS?

SOPS (Secrets OPerationS) is a tool that helps you encrypt and decrypt configuration files. It allows you to securely store your environment variables in version control while keeping sensitive information encrypted.

## Setup

### 1. Install SOPS

Follow the installation instructions for your platform:

- [SOPS Installation Guide](https://github.com/mozilla/sops#download)

### 2. Set up GPG for encryption

SOPS uses GPG for encryption. Generate a key pair:

```bash
# Check if GPG is installed
gpg --version

# If not installed (on Ubuntu/Debian)
sudo apt install gnupg

# If not installed (on macOS)
brew install gnupg

# Generate a GPG key pair (follow the interactive prompts)
gpg --full-generate-key
```

### 3. Get your GPG key fingerprint

```bash
# List your keys
gpg --list-secret-keys --keyid-format=long

# Example output:
# sec   rsa4096/1A2B3C4D5E6F7G8H 2023-01-01 [SC]
#       abcdef0123456789abcdef0123456789abcdef01
# uid                 [ultimate] Your Name <your.email@example.com>
# ssb   rsa4096/8H7G6F5E4D3C2B1A 2023-01-01 [E]

# Your key fingerprint is the part after "rsa4096/" on the "sec" line
# In this example: 1A2B3C4D5E6F7G8H
```

### 4. Configure SOPS

Update the `.sops.yaml` file in the project root with your GPG key fingerprint:

```yaml
creation_rules:
  - path_regex: \.env\..*
    pgp: 1A2B3C4D5E6F7G8H
```

Replace `1A2B3C4D5E6F7G8H` with your actual GPG key fingerprint.

## Usage

### Creating Environment Files

1. Copy the template:

   ```bash
   cp env.example .env
   ```

2. Edit `.env` with your actual values.

3. Encrypt the file:
   ```bash
   ./scripts/encrypt-env.sh [environment]
   ```
   Where `[environment]` is optional (defaults to `dev`).

### Decrypting Environment Files

To decrypt an environment file:

```bash
./scripts/decrypt-env.sh [environment]
```

Where `[environment]` is optional (defaults to `dev`).

### Running Applications

Use the run script which will automatically handle decryption if needed:

```bash
./scripts/run-app.sh [frontend|backend|all] [environment]
```

## Environment Management

### Multiple Environments

You can manage multiple environments by encrypting with different environment names:

```bash
# Encrypt for development
./scripts/encrypt-env.sh dev

# Encrypt for production
./scripts/encrypt-env.sh prod
```

This will create `.env.dev.enc` and `.env.prod.enc` files that you can safely commit to your repository.

### Team Access

To give team members access to the encrypted files:

1. Each team member generates their own GPG key pair
2. They export their public key:
   ```bash
   gpg --armor --export their.email@example.com > teammate_pubkey.asc
   ```
3. You import their public key:
   ```bash
   gpg --import teammate_pubkey.asc
   ```
4. Add their key fingerprints to the `.sops.yaml` file:

```yaml
creation_rules:
  - path_regex: \.env\..*
    pgp:
      - 1A2B3C4D5E6F7G8H # Your key
      - 8H7G6F5E4D3C2B1A # Team member's key
```

5. Re-encrypt the files to allow access with the new keys

## Best Practices

1. **Never commit unencrypted `.env` files** to your repository
2. Add `.env` to your `.gitignore` file
3. Only commit the encrypted `.env.*.enc` files
4. Rotate your encryption keys periodically for security
5. Keep your private keys secure and never share them
