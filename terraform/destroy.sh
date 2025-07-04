#!/bin/bash

# Exit on error
set -e

# Default environment
ENV=${1:-dev}

# Check if secrets.tfvars exists
if [ ! -f "environments/$ENV/secrets.tfvars" ]; then
  echo "Error: secrets.tfvars not found in environments/$ENV/"
  echo "Please create this file based on secrets.tfvars.example"
  exit 1
fi

# Change to the environment directory
cd "environments/$ENV"

# Warn the user
echo "WARNING: This will destroy all resources in the $ENV environment."
echo "This action cannot be undone and will result in data loss."
read -p "Are you ABSOLUTELY sure you want to proceed? (type 'yes' to confirm) " -r
echo

if [[ $REPLY == "yes" ]]; then
  # Plan the destruction
  echo "Planning Terraform destruction..."
  terraform plan -destroy -var-file="secrets.tfvars" -out=tfplan
  
  # Confirm before destroying
  read -p "Do you want to destroy these resources? (type 'yes' to confirm) " -r
  echo
  if [[ $REPLY == "yes" ]]; then
    # Apply the destruction
    echo "Destroying resources..."
    terraform apply tfplan
    
    echo "Destruction complete."
  else
    echo "Destruction cancelled."
  fi
else
  echo "Destruction cancelled."
fi 