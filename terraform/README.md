# Weiqi.com Infrastructure

This directory contains the Terraform configuration for deploying the Weiqi.com application infrastructure on AWS.

## Architecture

The infrastructure consists of:

- **Frontend**: Deployed on Vercel (managed outside of Terraform)
- **Backend**: Spring Boot application deployed on AWS EC2 in Docker
- **Database**: PostgreSQL on Amazon RDS
- **Cache**: Redis on Amazon ElastiCache
- **Storage**: S3 bucket for artifacts

## Prerequisites

- [Terraform](https://www.terraform.io/downloads.html) (v1.0.0+)
- [AWS CLI](https://aws.amazon.com/cli/) configured with appropriate credentials
- Docker installed locally for building images
- SSH key pair for EC2 access

## Directory Structure

```
terraform/
├── main.tf           # Main configuration
├── variables.tf      # Input variables
├── outputs.tf        # Output values
├── modules/
│   ├── networking/   # VPC, subnets, security groups
│   ├── database/     # RDS PostgreSQL
│   ├── cache/        # ElastiCache Redis
│   ├── ec2/          # EC2 instance
│   └── storage/      # S3 buckets
└── environments/
    ├── dev/          # Development environment
    ├── staging/      # Staging environment
    └── prod/         # Production environment
```

## Usage

### Initialize Terraform

```bash
cd terraform/environments/dev
terraform init
```

### Plan the Deployment

```bash
terraform plan -var-file="secrets.tfvars"
```

### Apply the Configuration

```bash
terraform apply -var-file="secrets.tfvars"
```

### Destroy the Infrastructure

```bash
terraform destroy -var-file="secrets.tfvars"
```

## Environment Variables

Create a `secrets.tfvars` file in the environment directory with the following variables:

```hcl
db_username = "your_db_username"
db_password = "your_db_password"
ssh_public_key = "your_ssh_public_key"  # Optional, defaults to ~/.ssh/id_rsa.pub
docker_image = "your-registry/weiqi-backend:latest"
supabase_jwt_secret = "your_supabase_jwt_secret"
```

## Outputs

After applying the Terraform configuration, you will get the following outputs:

- `vpc_id`: ID of the VPC
- `db_endpoint`: Endpoint of the database
- `redis_endpoint`: Endpoint of the Redis cache
- `ec2_public_ip`: Public IP of the EC2 instance
- `ec2_public_dns`: Public DNS of the EC2 instance
- `application_url`: URL of the application
- `artifact_bucket`: Name of the S3 bucket for artifacts

## Backend Deployment

1. Build the Docker image for the Spring Boot application:

```bash
cd ../../goweb-spring
docker build -t weiqi-backend:latest .
```

2. Tag and push the image to your Docker registry:

```bash
docker tag weiqi-backend:latest your-registry/weiqi-backend:latest
docker push your-registry/weiqi-backend:latest
```

3. Deploy the application to EC2:

```bash
cd ../terraform/environments/dev
terraform apply -var-file="secrets.tfvars"
```

## Frontend Deployment

The frontend is deployed on Vercel. See `docs/vercel-deployment.md` for instructions.
