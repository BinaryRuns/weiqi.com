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

# Initialize Terraform
echo "Initializing Terraform..."
terraform init

# Plan the deployment
echo "Planning Terraform deployment..."
terraform plan -var-file="secrets.tfvars" -out=tfplan

# Confirm before applying
read -p "Do you want to apply this plan? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  # Apply the plan
  echo "Applying Terraform plan..."
  terraform apply tfplan
  
  # Display the outputs
  echo "Deployment complete. Outputs:"
  terraform output
else
  echo "Deployment cancelled."
fi 