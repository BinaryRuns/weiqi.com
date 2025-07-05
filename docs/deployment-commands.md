# Deployment Commands

This document contains important commands for managing and deploying the Weiqi.com application.

## SSH Access

Connect to the EC2 instance:

```bash
ssh ec2-user@34.238.220.156 -i ~/.ssh/weiqi_ec2_key
```

## AWS Resources

### EC2

- Public IP: 34.238.220.156
- Public DNS: ec2-34-238-220-156.compute-1.amazonaws.com
- HTTPS: https://ec2-34-238-220-156.compute-1.amazonaws.com

### Database

- Endpoint: weiqi-dev-db.c0tmy0ws0hd5.us-east-1.rds.amazonaws.com
- Port: 5432
- Database: weiqi
- Username: postgres

### Redis

- Endpoint: weiqi-dev-redis.npiotz.0001.use1.cache.amazonaws.com
- Port: 6379

## Deployment

### Backend Deployment

To deploy the backend manually:

```bash
# Build the Docker image
cd goweb-spring
docker build -t weiqi-backend .

# Push to ECR (after logging in)
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin [your-account-id].dkr.ecr.us-east-1.amazonaws.com
docker tag weiqi-backend:latest [your-account-id].dkr.ecr.us-east-1.amazonaws.com/weiqi-backend:latest
docker push [your-account-id].dkr.ecr.us-east-1.amazonaws.com/weiqi-backend:latest
```

### Frontend Deployment

To deploy the frontend manually:

```bash
# Build the Next.js app
cd goweb
npm run build

# Deploy to Vercel
vercel --prod
```

## Terraform Commands

```bash
# Initialize Terraform
cd terraform/environments/dev
terraform init

# Plan changes
terraform plan -var-file="secrets.tfvars"

# Apply changes
terraform apply -var-file="secrets.tfvars"

# Destroy infrastructure
terraform destroy -var-file="secrets.tfvars"
```

## Docker Commands

### View running containers on EC2

```bash
ssh ec2-user@34.238.220.156 -i ~/.ssh/weiqi_ec2_key "docker ps"
```

### View logs from a container

```bash
ssh ec2-user@34.238.220.156 -i ~/.ssh/weiqi_ec2_key "docker logs [container_id]"
```

### Restart a container

```bash
ssh ec2-user@34.238.220.156 -i ~/.ssh/weiqi_ec2_key "docker restart [container_id]"
```

## Database Commands

### Connect to PostgreSQL database

```bash
psql -h weiqi-dev-db.c0tmy0ws0hd5.us-east-1.rds.amazonaws.com -U postgres -d weiqi
```

### Backup database

```bash
pg_dump -h weiqi-dev-db.c0tmy0ws0hd5.us-east-1.rds.amazonaws.com -U postgres -d weiqi > backup_$(date +%Y%m%d).sql
```

## Redis Commands

### Connect to Redis

```bash
redis-cli -h weiqi-dev-redis.npiotz.0001.use1.cache.amazonaws.com -p 6379
```

## SSL Certificate Management

### Generate a self-signed certificate

```bash
# Connect to EC2 instance
ssh ec2-user@34.238.220.156 -i ~/.ssh/weiqi_ec2_key

# Create directory for certificates if it doesn't exist
sudo mkdir -p /etc/nginx/ssl

# Generate a keystore file
sudo keytool -genkeypair -alias tomcat -keyalg RSA -keysize 2048 -storetype PKCS12 -keystore /etc/nginx/ssl/keystore.p12 -validity 3650 -storepass password
```

### Renew SSL certificate

```bash
# For Let's Encrypt certificates (when you have a domain)
sudo certbot renew
```

## GitHub Actions

To manually trigger the CI/CD pipeline:

1. Go to the GitHub repository
2. Click on "Actions"
3. Select the "Deploy Weiqi.com" workflow
4. Click "Run workflow"
## GitHub Secrets for CI/CD

In addition to the other secrets mentioned earlier, you need to add the following secret for SSL support:

- `SSL_KEY_STORE_PASSWORD`: The password for the SSL keystore (e.g., "password")
