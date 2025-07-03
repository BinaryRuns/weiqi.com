# Deploying the Backend to AWS EC2

This guide explains how to deploy the Weiqi.com Spring Boot backend to AWS EC2 using Terraform.

## Prerequisites

- [AWS CLI](https://aws.amazon.com/cli/) configured with appropriate credentials
- [Terraform](https://www.terraform.io/downloads.html) (v1.0.0+)
- [Docker](https://www.docker.com/get-started) installed locally
- SSH key pair for EC2 access

## Infrastructure Setup with Terraform

### 1. Initialize Terraform

```bash
cd terraform/environments/dev
terraform init
```

### 2. Create a `secrets.tfvars` File

Create a file named `secrets.tfvars` in the `terraform/environments/dev` directory with the following content:

```hcl
db_username = "your_db_username"
db_password = "your_secure_password"
ssh_public_key = "your_ssh_public_key"  # Optional, defaults to ~/.ssh/id_rsa.pub
docker_image = "your-registry/weiqi-backend:latest"
supabase_jwt_secret = "your_supabase_jwt_secret"
```

### 3. Plan the Deployment

```bash
terraform plan -var-file="secrets.tfvars"
```

This will show you what resources will be created.

### 4. Apply the Configuration

```bash
terraform apply -var-file="secrets.tfvars"
```

This will create:

- VPC with public and private subnets
- EC2 instance in the public subnet
- RDS PostgreSQL database in private subnet
- ElastiCache Redis cluster in private subnet
- S3 bucket for artifacts

### 5. Get the Outputs

After the deployment is complete, Terraform will display the outputs, including:

- `application_url`: The URL of your application
- `ec2_public_ip`: The public IP of your EC2 instance
- `db_endpoint`: The endpoint of your RDS database
- `redis_endpoint`: The endpoint of your Redis cache

## Architecture Overview

The deployment uses a simplified architecture:

1. **EC2 Instance**:

   - Runs in a public subnet with a public IP
   - Hosts the Spring Boot application in a Docker container
   - Security group allows HTTP, HTTPS, and SSH access

2. **RDS PostgreSQL**:

   - Runs in a private subnet
   - No direct internet access
   - Security group allows access only from the EC2 instance

3. **ElastiCache Redis**:
   - Runs in a private subnet
   - No direct internet access
   - Security group allows access only from the EC2 instance

## Manual Deployment

If you prefer to deploy manually instead of using the CI/CD pipeline:

### 1. Build the Spring Boot Application

```bash
cd goweb-spring
mvn clean package -DskipTests
```

### 2. Build the Docker Image

```bash
docker build -t weiqi-backend:latest .
```

### 3. Tag and Push the Image to ECR

```bash
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin <your-aws-account-id>.dkr.ecr.us-west-2.amazonaws.com
docker tag weiqi-backend:latest <your-aws-account-id>.dkr.ecr.us-west-2.amazonaws.com/weiqi-backend:latest
docker push <your-aws-account-id>.dkr.ecr.us-west-2.amazonaws.com/weiqi-backend:latest
```

### 4. SSH into the EC2 Instance

```bash
ssh ec2-user@<your-ec2-public-ip>
```

### 5. Update the Docker Compose File

```bash
cd /app
sudo nano docker-compose.yml
```

Update the image tag to the latest version.

### 6. Restart the Application

```bash
docker-compose pull
docker-compose up -d
```

## CI/CD Setup

The repository includes a GitHub Actions workflow in `.github/workflows/deploy.yml` that automatically:

1. Builds the Spring Boot application
2. Creates a Docker image
3. Pushes the image to ECR
4. Deploys to EC2 via SSH
5. Deploys the frontend to Vercel

To use this workflow, add the following secrets to your GitHub repository:

- `AWS_ACCESS_KEY_ID`: Your AWS access key
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
- `AWS_REGION`: The AWS region (e.g., `us-west-2`)
- `EC2_HOST`: The public IP or DNS of your EC2 instance
- `EC2_SSH_KEY`: Your private SSH key for EC2 access
- `DB_ENDPOINT`: The endpoint of your RDS database
- `DB_NAME`: The name of your database
- `DB_USERNAME`: The username for your database
- `DB_PASSWORD`: The password for your database
- `REDIS_ENDPOINT`: The endpoint of your Redis cache
- `SPRING_PROFILE`: The Spring profile to use (e.g., `prod`)
- `SUPABASE_JWT_SECRET`: Your Supabase JWT secret
- `NEXT_PUBLIC_API_URL`: The URL of your backend API
- `NEXT_PUBLIC_WS_URL`: The WebSocket URL of your backend
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `VERCEL_TOKEN`: Your Vercel API token
- `VERCEL_ORG_ID`: Your Vercel organization ID
- `VERCEL_PROJECT_ID`: Your Vercel project ID

## Monitoring and Logs

You can monitor your application and view logs on the EC2 instance:

1. SSH into the EC2 instance:

   ```bash
   ssh ec2-user@<your-ec2-public-ip>
   ```

2. View Docker container logs:
   ```bash
   cd /app
   docker-compose logs -f
   ```

## Scaling

For vertical scaling, you can modify the EC2 instance type in the Terraform configuration:

```hcl
# In terraform/environments/dev/variables.tf
variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"  # Change to a larger instance type if needed
}
```

For horizontal scaling, you would need to add a load balancer and auto-scaling group, which is not included in this simplified setup.

## Cleanup

To destroy all resources created by Terraform:

```bash
cd terraform/environments/dev
terraform destroy -var-file="secrets.tfvars"
```

**Warning**: This will delete all resources, including the database and any stored data.
