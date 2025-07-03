terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "local" {
    path = "terraform.tfstate"
  }
}

# Use existing AWS CLI configuration
provider "aws" {
  region = var.aws_region
}

# VPC and Networking
module "networking" {
  source = "./modules/networking"
  
  project_name        = var.project_name
  environment         = var.environment
  vpc_cidr            = var.vpc_cidr
  availability_zones  = var.availability_zones
  public_subnet_cidrs = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
}

# Database
module "database" {
  source = "./modules/database"
  
  project_name       = var.project_name
  environment        = var.environment
  vpc_id             = module.networking.vpc_id
  subnet_ids         = module.networking.private_subnet_ids
  security_group_id  = module.networking.db_security_group_id
  db_instance_class  = var.db_instance_class
  db_name            = var.db_name
  db_username        = var.db_username
  db_password        = var.db_password
  db_port            = var.db_port
}

# Redis Cache
module "cache" {
  source = "./modules/cache"
  
  project_name       = var.project_name
  environment        = var.environment
  vpc_id             = module.networking.vpc_id
  subnet_ids         = module.networking.private_subnet_ids
  security_group_id  = module.networking.redis_security_group_id
  redis_node_type    = var.redis_node_type
  redis_port         = var.redis_port
}

# EC2 Instance
module "ec2" {
  source = "./modules/ec2"
  
  project_name       = var.project_name
  environment        = var.environment
  security_group_id  = module.networking.ec2_security_group_id
  subnet_id          = module.networking.public_subnet_ids[0]
  instance_type      = var.instance_type
  ssh_public_key     = var.ssh_public_key
  
  # Docker image
  docker_image       = var.docker_image
  
  # Database connection
  db_endpoint        = module.database.db_endpoint
  db_port            = var.db_port
  db_name            = var.db_name
  db_username        = var.db_username
  db_password        = var.db_password
  
  # Redis connection
  redis_endpoint     = module.cache.redis_endpoint
  redis_port         = var.redis_port
  
  # Supabase
  supabase_jwt_secret = var.supabase_jwt_secret
}

# S3 Storage for artifacts
module "storage" {
  source = "./modules/storage"
  
  project_name       = var.project_name
  environment        = var.environment
} 