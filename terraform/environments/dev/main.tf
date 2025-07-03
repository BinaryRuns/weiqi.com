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

provider "aws" {
  region = var.aws_region
}

module "weiqi_infrastructure" {
  source = "../../"
  
  # General
  project_name = var.project_name
  environment  = "dev"
  
  # VPC
  aws_region           = var.aws_region
  vpc_cidr             = var.vpc_cidr
  availability_zones   = var.availability_zones
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
  
  # Database
  db_instance_class = var.db_instance_class
  db_name           = var.db_name
  db_username       = var.db_username
  db_password       = var.db_password
  db_port           = var.db_port
  
  # Redis
  redis_node_type = var.redis_node_type
  redis_port      = var.redis_port
  
  # EC2
  instance_type   = var.instance_type
  ssh_public_key  = var.ssh_public_key
  docker_image    = var.docker_image
  
  # Supabase
  supabase_jwt_secret = var.supabase_jwt_secret
} 